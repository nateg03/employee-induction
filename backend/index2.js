require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const db = require("./database");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

console.log("✅ Backend running on http://localhost:5001");

// ✅ Authentication Routes
app.use("/auth", authRoutes);

// ✅ Fix: Route to Get User Progress
app.get("/get-progress/:userId", (req, res) => {
  const userId = req.params.userId;

  db.all("SELECT document_name, is_read FROM read_progress WHERE user_id = ?", [userId], (err, rows) => {
      if (err) {
          console.error("❌ Database error fetching progress:", err);
          return res.status(500).json({ error: "Database error" });
      }

      if (!rows || rows.length === 0) {
          console.warn("⚠️ No progress found for this user.");
          return res.json({});
      }

      const progressData = {};
      rows.forEach((row) => {
          progressData[row.document_name] = row.is_read === 1;
      });

      res.json(progressData);
  });
});


// ✅ Fix: Route to Save Progress
app.post("/save-progress", async (req, res) => {
    const { userId, readDocuments } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        db.serialize(() => {
            Object.keys(readDocuments).forEach(docName => {
                db.run(
                    `INSERT INTO read_progress (user_id, document_name, is_read) 
                     VALUES (?, ?, ?) 
                     ON CONFLICT(user_id, document_name) 
                     DO UPDATE SET is_read = excluded.is_read`,
                    [userId, docName, readDocuments[docName] ? 1 : 0]
                );
            });
        });

        res.json({ success: true, message: "Progress updated successfully" });
    } catch (error) {
        console.error("❌ Error saving progress:", error);
        res.status(500).json({ error: "Failed to save progress" });
    }
});

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
