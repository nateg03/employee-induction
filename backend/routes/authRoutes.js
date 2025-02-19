const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database");
require("dotenv").config();

const router = express.Router();

// ✅ LOGIN ROUTE FIXED
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("🟡 Login Attempt:", email, password); // Debugging

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ error: "Server error" });
        }
        if (!user) {
            console.log("❌ User not found:", email);
            return res.status(400).json({ error: "Invalid email or password" });
        }

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


module.exports = router;
