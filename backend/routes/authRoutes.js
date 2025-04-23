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
  const allDocsQuery = "SELECT filename FROM documents";

  db.query(allDocsQuery, (err, docResults) => {
    if (err) return res.status(500).json({ error: "Error fetching documents" });

    const totalDocs = docResults.map((d) => d.filename); // actual document filenames
    const totalRequired = totalDocs.length + 2; // documents + 2 quizzes

    const query = `
      SELECT 
        u.id, u.username, u.email, u.role,
        (SELECT COUNT(*) FROM read_progress WHERE user_id = u.id AND is_read = 1 AND document_name IN (?)) AS readCount,
        (SELECT COUNT(*) FROM quiz_submissions WHERE user_id = u.id AND approved = 1) AS inductionApproved,
        (SELECT COUNT(*) FROM manual_handling_submissions WHERE user_id = u.id AND approved = 1) AS mhApproved
      FROM users u
    `;

    db.query(query, [totalDocs], (err, results) => {
      if (err) return res.status(500).json({ error: "Error calculating user progress" });

      const users = results.map(user => {
        const readDocs = user.readCount || 0;
        const inductionQuiz = user.inductionApproved ? 1 : 0;
        const mhQuiz = user.mhApproved ? 1 : 0;

        const completed = readDocs + inductionQuiz + mhQuiz;
        const progress = Math.min(100, Math.round((completed / totalRequired) * 100));

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          progress
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

// ✅ Accurate progress percentage including both quizzes and read documents
router.get("/progress-percent/:userId", verifyToken, (req, res) => {
  const userId = req.params.userId;

  const allDocsQuery = "SELECT filename FROM documents";
  const readDocsQuery = "SELECT document_name FROM read_progress WHERE user_id = ? AND is_read = 1";
  const inductionQuizQuery = "SELECT approved FROM quiz_submissions WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 1";
  const mhQuizQuery = "SELECT approved FROM manual_handling_submissions WHERE user_id = ? LIMIT 1";

  db.query(allDocsQuery, (err, allDocsResult) => {
    if (err) return res.status(500).json({ error: "Error fetching documents" });

    const totalDocs = allDocsResult.map(d => d.filename); // all expected filenames

    db.query(readDocsQuery, [userId], (err, readDocsResult) => {
      if (err) return res.status(500).json({ error: "Error fetching read documents" });

      const readDocs = readDocsResult.map(r => r.document_name);

      // Count only matching filenames
      const matchedDocs = totalDocs.filter(filename => readDocs.includes(filename));
      const readCount = matchedDocs.length;

      db.query(inductionQuizQuery, [userId], (err, quizResult) => {
        if (err) return res.status(500).json({ error: "Induction quiz error" });

        const inductionApproved = quizResult.length > 0 && quizResult[0].approved === 1;

        db.query(mhQuizQuery, [userId], (err, mhResult) => {
          if (err) return res.status(500).json({ error: "Manual handling quiz error" });

          const mhApproved = mhResult.length > 0 && mhResult[0].approved === 1;

          const completed = readCount + (inductionApproved ? 1 : 0) + (mhApproved ? 1 : 0);
          const total = totalDocs.length + 2; // docs + quizzes
          const progress = Math.min(100, Math.round((completed / total) * 100));

          res.json({
            progress,
            completedItems: completed,
            totalItems: total,
            totalDocs: totalDocs.length,
            readDocs: readCount,
            inductionApproved,
            mhApproved
          });
        });
      });
    });
  });
});



module.exports = router;
