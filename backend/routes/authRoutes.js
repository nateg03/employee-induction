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

// ✅ Fetch User Info
router.get("/me", verifyToken, (req, res) => {
    db.query("SELECT id, username, email, role FROM users WHERE id = ?", [req.user.id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).json({ error: "User not found" });
        }
        res.json({ user: results[0] });
    });
});

// ✅ Fetch Users with Progress
router.get("/users-progress", verifyToken, (req, res) => {
    const query = `
        SELECT users.id, users.username, users.email, users.role, 
               ROUND((COUNT(read_progress.document_name) / 5) * 100, 2) AS progress
        FROM users
        LEFT JOIN read_progress ON users.id = read_progress.user_id AND read_progress.is_read = 1
        GROUP BY users.id;
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
});

// ✅ Register New User
router.post("/register", async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
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

// ✅ User Login
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ error: "Invalid email or password" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "✅ Login successful", token, user });
    });
});

// ✅ Fetch User Progress
router.get("/get-progress/:userId", verifyToken, (req, res) => {
    db.query("SELECT document_name, is_read FROM read_progress WHERE user_id = ?", [req.params.userId], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        const progressData = {};
        results.forEach(row => progressData[row.document_name] = row.is_read);

        res.json(progressData);
    });
});

// ✅ Save User Progress
router.post("/save-progress", verifyToken, (req, res) => {
    const { userId, readDocuments } = req.body;

    if (!userId || !readDocuments) {
        return res.status(400).json({ error: "User ID and progress data are required" });
    }

    const progressUpdates = Object.entries(readDocuments).map(([doc, isRead]) => [userId, doc, isRead ? 1 : 0]);

    db.query("DELETE FROM read_progress WHERE user_id = ?", [userId], (err) => {
        if (err) return res.status(500).json({ error: "Failed to update progress" });

        db.query("INSERT INTO read_progress (user_id, document_name, is_read) VALUES ?", [progressUpdates], (err) => {
            if (err) return res.status(500).json({ error: "Failed to save progress" });
            res.json({ message: "✅ Progress saved successfully" });
        });
    });
});

module.exports = router;
