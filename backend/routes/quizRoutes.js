const express = require("express");
const router = express.Router();
const db = require("../database");
const authenticateToken = require("../middleware/authMiddleware");

// Submit quiz
router.post("/submit", authenticateToken, (req, res) => {
    const { userId, answers } = req.body;
  
    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ error: "Invalid answers" });
    }
  
    const checkQuery = "SELECT * FROM quiz_submissions WHERE user_id = ?";
    db.query(checkQuery, [userId], (err, results) => {
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
  

// Fetch all quiz submissions
router.get("/submissions", authenticateToken, (req, res) => {
    const sql = `
      SELECT qs.id, qs.user_id, qs.answers, qs.submitted_at, qs.approved,
             u.username, u.email
      FROM quiz_submissions qs
      JOIN users u ON qs.user_id = u.id
      ORDER BY qs.submitted_at DESC
    `;
    db.query(sql, (err, results) => {
      if (err) {
        console.error("❌ Failed to fetch quiz submissions:", err);
        return res.status(500).json({ error: "Failed to load submissions" });
      }
      res.json(results);
    });
  });

//Status Route
router.get("/status/:userId", authenticateToken, (req, res) => {
    const userId = req.params.userId;
  
    db.query(
      "SELECT approved FROM quiz_submissions WHERE user_id = ? LIMIT 1",
      [userId],
      (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to check status" });
  
        if (results.length === 0) {
          return res.json({ submitted: false, approved: false });
        }
  
        res.json({
          submitted: true,
          approved: results[0].approved === 1,
        });
      }
    );
  });
  
  

// Approve quiz submission
router.post("/approve/:id", authenticateToken, (req, res) => {
    const submissionId = req.params.id;
  
    db.query(
      "UPDATE quiz_submissions SET approved = 1 WHERE id = ?",
      [submissionId],
      (err, result) => {
        if (err) {
          console.error("❌ Approve quiz error:", err);
          return res.status(500).json({ error: "Failed to approve submission" });
        }
        res.json({ success: true });
      }
    );
  });
  
  // Unapprove quiz submission
  router.post("/unapprove/:id", authenticateToken, (req, res) => {
    const submissionId = req.params.id;
  
    db.query(
      "UPDATE quiz_submissions SET approved = 0 WHERE id = ?",
      [submissionId],
      (err, result) => {
        if (err) {
          console.error("❌ Unapprove quiz error:", err);
          return res.status(500).json({ error: "Failed to unapprove submission" });
        }
        res.json({ success: true });
      }
    );
  });
  

// ✅ Delete a quiz submission
router.delete("/delete/:id", authenticateToken, (req, res) => {
    const submissionId = req.params.id;
  
    db.query("DELETE FROM quiz_submissions WHERE id = ?", [submissionId], (err, result) => {
      if (err) {
        console.error("❌ Delete quiz error:", err);
        return res.status(500).json({ error: "Failed to delete submission" });
      }
  
      res.json({ success: true, message: "✅ Submission deleted" });
    });
  });
  

module.exports = router;
