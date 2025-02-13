const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database");

const router = express.Router();

// ✅ Register a New User (Admin Only)
router.post("/admin/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
            if (user) return res.status(400).json({ error: "User already exists" });

            const hashedPassword = await bcrypt.hash(password, 10);
            db.run("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
                [name, email, hashedPassword, role], (err) => {
                    if (err) return res.status(500).json({ error: "Error creating user" });
                    res.json({ message: "User created successfully" });
                });
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Login User
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (!user) return res.status(400).json({ error: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user });
    });
});

// ✅ Get User Details (Protected)
router.get("/me", async (req, res) => {
    const token = req.headers["x-auth-token"];
    if (!token) return res.status(401).json({ error: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        db.get("SELECT id, username, email, role FROM users WHERE id = ?", [decoded.id], (err, user) => {
            if (!user) return res.status(400).json({ error: "User not found" });
            res.json(user);
        });
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
});

module.exports = router;
