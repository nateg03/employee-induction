require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database"); // Connects to MySQL
const { body, validationResult } = require("express-validator");

const router = express.Router();

// 🟢 Register User
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password, role } = req.body;

    try {
      const [existingUser] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
      if (existingUser.length > 0) return res.status(400).json({ error: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);

      await db.promise().query("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)", [
        username,
        email,
        hashedPassword,
        role || "employee",
      ]);

      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      console.error("❌ Registration Error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// 🔵 User Login
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res) => {
    const { email, password } = req.body;

    try {
      const [users] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
      if (users.length === 0) return res.status(400).json({ error: "Invalid credentials" });

      const user = users[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "2h" });

      res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    } catch (err) {
      console.error("❌ Login Error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// 🔵 Get All Users (Admin Only)
// Ensure Authorization Header Exists
router.get("/users", async (req, res) => {
  try {
      const authHeader = req.headers.authorization;
      
      console.log("🔵 Received Auth Header:", authHeader); // ✅ Debugging Log

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({ message: "Unauthorized. No valid token provided." });
      }

      const token = authHeader.split(" ")[1];

      console.log("🟢 Extracted Token:", token); // ✅ Debugging Extracted Token

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== "admin") return res.status(403).json({ message: "Forbidden: Admin access only." });

      // Fetch all users
      const [users] = await db.promise().query("SELECT id, username, email, role FROM users");

      res.json(users);
  } catch (err) {
      console.error("❌ Fetch Users Error:", err);
      res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
});



// 🔵 Get User Profile
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized, please log in" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await db.promise().query("SELECT id, username, email, role FROM users WHERE id = ?", [decoded.id]);

    if (users.length === 0) return res.status(404).json({ error: "User not found" });

    res.json(users[0]);
  } catch (err) {
    console.error("❌ Auth Error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
