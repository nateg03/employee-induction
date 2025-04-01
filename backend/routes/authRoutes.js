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

// ✅ Fetch users with accurate progress
router.get("/users-progress", verifyToken, (req, res) => {
  const totalDocsQuery = "SELECT COUNT(*) AS total FROM documents";

  db.query(totalDocsQuery, (err, docResults) => {
    if (err) return res.status(500).json({ error: "Document count error" });

    const totalDocs = docResults[0].total;

    if (totalDocs === 0) {
      return db.query("SELECT id, username, email, role FROM users", (err, users) => {
        if (err) return res.status(500).json({ error: "User fetch error" });
        return res.json(users.map(u => ({ ...u, progress: 0 })));
      });
    }

    const progressQuery = `
      SELECT 
        u.id, u.username, u.email, u.role,
        COUNT(r.document_name) AS readCount
      FROM users u
      LEFT JOIN read_progress r ON u.id = r.user_id AND r.is_read = 1
      LEFT JOIN documents d ON r.document_name = d.filename
      GROUP BY u.id
    `;

    db.query(progressQuery, (err, results) => {
      if (err) return res.status(500).json({ error: "Progress fetch error" });

      const users = results.map(user => {
        const progress = Math.round((user.readCount / totalDocs) * 100);
        return { ...user, progress };
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

// ✅ Fetch user progress
router.get("/get-progress/:userId", verifyToken, (req, res) => {
  db.query(
    "SELECT document_name, is_read FROM read_progress WHERE user_id = ?",
    [req.params.userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      const progressData = {};
      results.forEach((row) => {
        progressData[row.document_name] = row.is_read;
      });

      res.json(progressData);
    }
  );
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
