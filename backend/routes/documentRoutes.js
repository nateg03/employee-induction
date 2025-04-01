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

// POST /documents/upload-multiple
router.post("/upload-multiple", upload.array("files", 10), (req, res) => {
    const files = req.files;
  
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }
  
    const values = files.map((file) => {
      const title = file.originalname.split(".").slice(0, -1).join("."); // use filename as title
      return [title, file.filename];
    });
  
    const query = "INSERT INTO documents (title, filename) VALUES ?";
    db.query(query, [values], (err) => {
      if (err) {
        console.error("❌ Upload error:", err);
        return res.status(500).json({ error: "Upload failed" });
      }
      res.json({ message: "✅ Documents uploaded!" });
    });
  });
  

// DELETE /documents/:id
router.delete("/:id", (req, res) => {
    const docId = req.params.id;
  
    // 1. First, get the filename from DB
    const selectQuery = "SELECT filename FROM documents WHERE id = ?";
    db.query(selectQuery, [docId], (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ error: "Document not found" });
      }
  
      const filename = results[0].filename;
      const filePath = path.join(__dirname, "..", "uploads", filename);
  
      // 2. Delete the file first (optional if it exists)
      fs.unlink(filePath, (fsErr) => {
        if (fsErr && fsErr.code !== "ENOENT") {
          console.error("❌ Failed to delete file:", fsErr);
          return res.status(500).json({ error: "Failed to delete file" });
        }
  
        // 3. Delete the record from DB
        const deleteQuery = "DELETE FROM documents WHERE id = ?";
        db.query(deleteQuery, [docId], (dbErr) => {
          if (dbErr) {
            console.error("❌ Failed to delete document from DB:", dbErr);
            return res.status(500).json({ error: "Failed to delete document" });
          }
  
          res.json({ message: "✅ Document deleted" });
        });
      });
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
