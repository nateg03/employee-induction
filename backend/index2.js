require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const db = require("./database");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());

// ✅ Allow frontend requests
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

console.log("✅ SQLite Database Connected Successfully!");
app.use("/auth", authRoutes);

// 🔒 Middleware to Authenticate Users
const authenticate = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access Denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid Token" });
  }
};

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
