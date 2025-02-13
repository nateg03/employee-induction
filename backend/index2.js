require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

const db = new sqlite3.Database("induction.sqlite");

// ✅ Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};

// ✅ Login Endpoint
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  });
});

// ✅ Get User Info
app.get("/auth/me", authenticate, (req, res) => {
  db.get("SELECT id, username, email, role FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (!user) return res.status(400).json({ error: "User not found" });
    res.json(user);
  });
});

// ✅ Get Progress
app.get("/progress/:id", authenticate, (req, res) => {
  db.get("SELECT COUNT(*) AS progress FROM read_progress WHERE user_id = ?", [req.params.id], (err, row) => {
    res.json({ progress: row.progress * 20 });
  });
});

// ✅ Start Server
app.listen(5001, () => console.log("✅ Server running on http://localhost:5001"));
