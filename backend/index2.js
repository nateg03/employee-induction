const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ MySQL Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "n!n3r3dmonk3ys!",
    database: "induction",
});

db.connect((err) => {
    if (err) {
        console.error("❌ MySQL Connection Failed:", err.message);
        return;
    }
    console.log("✅ MySQL Database Connected!");
});

// ✅ User Login Route
app.post("/auth/login", (req, res) => {
    const { email, password } = req.body;
    console.log("🟡 Login Attempt:", email);

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ error: "Server error" });
        }
        if (results.length === 0) {
            console.log("❌ User not found:", email);
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("❌ Password incorrect for:", email);
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        console.log("✅ Login successful for:", email);
        res.json({ token, user });
    });
});

// ✅ Save Induction Progress
app.post("/auth/save-progress", (req, res) => {
    const { userId, readDocuments } = req.body;

    if (!userId || !readDocuments) {
        return res.status(400).json({ error: "Missing userId or readDocuments" });
    }

    console.log("🟡 Saving progress for user", userId, ":", readDocuments);

    const queries = Object.keys(readDocuments).map(documentName => {
        return new Promise((resolve, reject) => {
            db.query(
                `INSERT INTO read_progress (user_id, document_name, is_read) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE is_read = VALUES(is_read)`,
                [userId, documentName, readDocuments[documentName] ? 1 : 0],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    });

    Promise.all(queries)
        .then(() => {
            console.log("✅ Progress saved successfully");
            res.json({ message: "Progress saved" });
        })
        .catch(err => {
            console.error("❌ Error saving progress:", err.message);
            res.status(500).json({ error: "Failed to save progress" });
        });
});

// ✅ Get Induction Progress
app.get("/auth/get-progress/:userId", (req, res) => {
    const { userId } = req.params;

    db.query(
        "SELECT document_name, is_read FROM read_progress WHERE user_id = ?",
        [userId],
        (err, results) => {
            if (err) {
                console.error("❌ Error fetching progress:", err.message);
                return res.status(500).json({ error: "Failed to fetch progress" });
            }

            if (results.length === 0) {
                console.log("⚠️ No progress found for user:", userId);
                return res.json({});
            }

            const progressData = {};
            results.forEach(row => {
                progressData[row.document_name] = row.is_read === 1;
            });

            console.log("✅ Progress fetched successfully:", progressData);
            res.json(progressData);
        }
    );
});

// ✅ Start Server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});
