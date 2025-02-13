const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" } // Default role is "user"
}));

// ✅ Middleware to Check if User is Admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== "admin") return res.status(403).json({ msg: "Access denied. Admins only." });
    next();
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Register a New User (Admin Only)
router.post(
  "/register",
  authMiddleware, // Ensure the user is logged in
  isAdmin, // Ensure the user is an admin
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    check("role", "Role is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: "User already exists" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({ name, email, password: hashedPassword, role });

      await user.save();

      res.json({ msg: "User registered successfully" });
    } catch (err) {
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
