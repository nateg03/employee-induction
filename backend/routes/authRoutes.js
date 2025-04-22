const express = require("express");
const db = require("../database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// ✅ Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized access" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// ✅ Fetch logged-in user info
router.get("/me", verifyToken, (req, res) => {
  db.query(
    "SELECT id, username, email, role FROM users WHERE id = ?",
    [req.user.id],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(500).json({ error: "User not found" });
      }
      res.json({ user: results[0] });
    }
  );
});

router.get("/users-progress", verifyToken, (req, res) => {
  const totalDocsQuery = "SELECT COUNT(*) AS total FROM documents";

  db.query(totalDocsQuery, (err, docResults) => {
    if (err) return res.status(500).json({ error: "Document count error" });

    const totalDocs = docResults[0].total;

    const query = `
      SELECT 
        u.id, u.username, u.email, u.role,
        COUNT(DISTINCT rp.document_name) AS readCount,
        (SELECT COUNT(*) FROM quiz_submissions WHERE user_id = u.id AND approved = 1) AS quizApproved
      FROM users u
      LEFT JOIN read_progress rp ON rp.user_id = u.id AND rp.is_read = 1
      GROUP BY u.id
    `;

    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: "User progress error" });

      const totalRequired = totalDocs + 1; // +1 for quiz
      const users = results.map(u => {
        const completed = u.readCount + (u.quizApproved ? 1 : 0);
        return {
          ...u,
          progress: Math.round((completed / totalRequired) * 100)
        };
      });

      res.json(users);
    });
  });
});



// ✅ Register user
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, role],
      (err) => {
        if (err) return res.status(500).json({ error: "Registration failed" });
        res.json({ message: "✅ User registered successfully" });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Login user
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err || results.length === 0)
      return res.status(401).json({ error: "Invalid email or password" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "✅ Login successful", token, user });
  });
});

// ✅ Fetch user progress including quiz approval
router.get("/get-progress/:userId", verifyToken, (req, res) => {
  const userId = req.params.userId;

  const progressData = {};

  const readDocsQuery = "SELECT document_name, is_read FROM read_progress WHERE user_id = ?";
  const quizQuery = "SELECT approved FROM quiz_submissions WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 1";

  db.query(readDocsQuery, [userId], (err, readResults) => {
    if (err) return res.status(500).json({ error: "Failed to fetch read documents" });

    readResults.forEach(row => {
      progressData[row.document_name] = row.is_read;
    });

    db.query(quizQuery, [userId], (quizErr, quizResults) => {
      if (quizErr) return res.status(500).json({ error: "Failed to fetch quiz status" });

      // Save the quiz progress as "quiz" key
      progressData["quiz"] = quizResults.length > 0 && quizResults[0].approved === 1;

      res.json(progressData);
    });
  });
});


// ✅ Save user progress
router.post("/save-progress", verifyToken, (req, res) => {
  const { userId, readDocuments } = req.body;

  if (!userId || !readDocuments) {
    return res.status(400).json({ error: "User ID and progress data are required" });
  }

  const progressUpdates = Object.entries(readDocuments).map(([doc, isRead]) => [
    userId,
    doc,
    isRead ? 1 : 0,
  ]);

  db.query("DELETE FROM read_progress WHERE user_id = ?", [userId], (err) => {
    if (err) return res.status(500).json({ error: "Failed to update progress" });

    if (progressUpdates.length === 0) return res.json({ message: "✅ Progress cleared" });

    db.query(
      "INSERT INTO read_progress (user_id, document_name, is_read) VALUES ?",
      [progressUpdates],
      (err) => {
        if (err) return res.status(500).json({ error: "Failed to save progress" });
        res.json({ message: "✅ Progress saved successfully" });
      }
    );
  });
});

// ✅ Delete user
router.delete("/users/:id", verifyToken, (req, res) => {
  const userId = req.params.id;

  db.query("DELETE FROM users WHERE id = ?", [userId], (err) => {
    if (err) return res.status(500).json({ error: "Failed to delete user" });
    res.json({ message: "✅ User deleted" });
  });
});

module.exports = router;
