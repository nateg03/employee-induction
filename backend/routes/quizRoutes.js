const express = require("express");
const db = require("../database");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================
// ✅ INDUCTION TYPED QUIZ
// ==========================

// Submit induction typed-answer quiz
router.post("/submit", authenticateToken, (req, res) => {
  const { userId, answers } = req.body;
  if (!answers || typeof answers !== "object") {
    return res.status(400).json({ error: "Invalid answers" });
  }

  db.query("SELECT * FROM quiz_submissions WHERE user_id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length > 0) return res.status(400).json({ error: "Submission already exists" });

    const quizData = JSON.stringify(answers);
    db.query(
      "INSERT INTO quiz_submissions (user_id, answers, submitted_at) VALUES (?, ?, NOW())",
      [userId, quizData],
      (err) => {
        if (err) return res.status(500).json({ error: "Failed to submit answers" });
        res.json({ success: true });
      }
    );
  });
});

// Get induction quiz status
router.get("/status/:userId", authenticateToken, (req, res) => {
  const userId = req.params.userId;
  db.query("SELECT approved FROM quiz_submissions WHERE user_id = ? LIMIT 1", [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to check status" });

    if (results.length === 0) {
      return res.json({ submitted: false, approved: false });
    }

    res.json({ submitted: true, approved: results[0].approved === 1 });
  });
});

// Get all induction quiz submissions
router.get("/submissions", authenticateToken, (req, res) => {
  const sql = `
    SELECT qs.id, qs.user_id, qs.answers, qs.submitted_at, qs.approved,
           u.username, u.email
    FROM quiz_submissions qs
    JOIN users u ON qs.user_id = u.id
    ORDER BY qs.submitted_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to load submissions" });
    res.json(results);
  });
});

// Approve/Unapprove induction quiz
router.post("/approve/:id", authenticateToken, (req, res) => {
  db.query("UPDATE quiz_submissions SET approved = 1 WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to approve submission" });
    res.json({ success: true });
  });
});

router.post("/unapprove/:id", authenticateToken, (req, res) => {
  db.query("UPDATE quiz_submissions SET approved = 0 WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to unapprove submission" });
    res.json({ success: true });
  });
});

// Delete induction quiz submission
router.delete("/delete/:id", authenticateToken, (req, res) => {
  db.query("DELETE FROM quiz_submissions WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to delete submission" });
    res.json({ message: "✅ Submission deleted" });
  });
});

// CRUD for typed-answer questions
router.get("/typed-questions", (req, res) => {
  db.query("SELECT * FROM quiz_questions", (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch questions" });
    res.json(results);
  });
});

router.post("/typed-questions", (req, res) => {
  const { question } = req.body;
  if (!question || !question.trim()) return res.status(400).json({ error: "Question is required" });

  db.query("INSERT INTO quiz_questions (question) VALUES (?)", [question], (err) => {
    if (err) return res.status(500).json({ error: "Failed to add question" });
    res.json({ message: "✅ Question added" });
  });
});

router.put("/typed-questions/:id", (req, res) => {
  const { question } = req.body;
  if (!question || !question.trim()) return res.status(400).json({ error: "Cannot be empty" });

  db.query("UPDATE quiz_questions SET question = ? WHERE id = ?", [question, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to update question" });
    res.json({ message: "✅ Question updated" });
  });
});

router.delete("/typed-questions/:id", (req, res) => {
  db.query("DELETE FROM quiz_questions WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to delete question" });
    res.json({ message: "✅ Question deleted" });
  });
});

// ==========================
// ✅ MANUAL HANDLING QUIZ
// ==========================

// Get all multiple-choice questions
router.get("/manual-handling", (req, res) => {
  const sql = `
    SELECT id, question, option_a, option_b, option_c, option_d, correct_answer, multi_select
    FROM manual_handling_questions
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch manual handling quiz:", err);
      return res.status(500).json({ error: "Failed to load manual handling quiz" });
    }
    res.json(results);
  });
});

// Submit MH quiz answers
router.post("/manual-handling/submit", authenticateToken, (req, res) => {
  const { userId, answers } = req.body;
  if (!answers || typeof answers !== "object") {
    return res.status(400).json({ error: "Invalid answers" });
  }

  db.query("SELECT * FROM manual_handling_submissions WHERE user_id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length > 0) return res.status(400).json({ error: "Already submitted" });

    const answersJson = JSON.stringify(answers);
    db.query(
      "INSERT INTO manual_handling_submissions (user_id, answers, submitted_at) VALUES (?, ?, NOW())",
      [userId, answersJson],
      (err) => {
        if (err) return res.status(500).json({ error: "Submission failed" });
        res.json({ success: true });
      }
    );
  });
});

// Get MH quiz status
router.get("/manual-handling/status/:userId", authenticateToken, (req, res) => {
  const userId = req.params.userId;
  db.query("SELECT approved FROM manual_handling_submissions WHERE user_id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Status check failed" });

    if (results.length === 0) return res.json({ submitted: false, approved: false });

    res.json({
      submitted: true,
      approved: results[0].approved === 1,
    });
  });
});

// Admin view MH submissions
router.get("/manual-handling/submissions", authenticateToken, (req, res) => {
  const sql = `
    SELECT mhs.id, mhs.user_id, mhs.answers, mhs.submitted_at, mhs.approved,
           u.username, u.email
    FROM manual_handling_submissions mhs
    JOIN users u ON u.id = mhs.user_id
    ORDER BY mhs.submitted_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to load submissions" });
    res.json(results);
  });
});

// Approve/Unapprove MH
router.post("/manual-handling/approve/:id", authenticateToken, (req, res) => {
  db.query("UPDATE manual_handling_submissions SET approved = 1 WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Approval failed" });
    res.json({ success: true });
  });
});

router.post("/manual-handling/unapprove/:id", authenticateToken, (req, res) => {
  db.query("UPDATE manual_handling_submissions SET approved = 0 WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Unapproval failed" });
    res.json({ success: true });
  });
});

// Delete MH submission
router.delete("/manual-handling/delete/:id", authenticateToken, (req, res) => {
  db.query("DELETE FROM manual_handling_submissions WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ success: true });
  });
});

module.exports = router;
