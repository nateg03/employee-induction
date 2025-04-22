const express = require("express");
const router = express.Router();
const db = require("../database");
const { Parser } = require("json2csv");

router.get("/users-csv", (req, res) => {
  const query = `
    SELECT 
      u.username,
      u.email,
      u.role,
      ROUND((COUNT(rp.document_name) / (
        SELECT COUNT(*) FROM documents
      )) * 100, 2) AS progress
    FROM users u
    LEFT JOIN read_progress rp ON u.id = rp.user_id AND rp.is_read = 1
    GROUP BY u.id, u.username, u.email, u.role
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ CSV Export Error:", err);
      return res.status(500).json({ error: "Failed to export CSV" });
    }

    try {
      const fields = ["username", "email", "role", "progress"];
      const json2csv = new Parser({ fields });
      const csv = json2csv.parse(results);

      res.header("Content-Type", "text/csv");
      res.attachment("user_progress.csv");
      res.send(csv);
    } catch (parseErr) {
      console.error("❌ CSV Parsing Error:", parseErr);
      res.status(500).json({ error: "Failed to export CSV" });
    }
  });
});

module.exports = router;
