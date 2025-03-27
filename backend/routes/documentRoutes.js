const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../database");
const router = express.Router();

// Set upload folder
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Create upload folder if not exists
const fs = require("fs");
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// POST /documents/upload
router.post("/upload", upload.single("file"), (req, res) => {
  const { title } = req.body;
  const filename = req.file.filename;

  if (!title || !filename) {
    return res.status(400).json({ error: "Missing title or file." });
  }

  const query = "INSERT INTO documents (title, filename) VALUES (?, ?)";
  db.query(query, [title, filename], (err) => {
    if (err) {
      console.error("❌ Upload error:", err);
      return res.status(500).json({ error: "Upload failed" });
    }
    res.json({ message: "✅ Document uploaded!" });
  });
});

// GET /documents
router.get("/", (req, res) => {
  db.query("SELECT * FROM documents", (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to load docs" });
    res.json(results);
  });
});

module.exports = router;
