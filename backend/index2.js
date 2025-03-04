require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./database");
const authRoutes = require("./routes/authRoutes"); // Ensure the correct filename

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/auth", authRoutes);

// ✅ Start Server
const PORT = 5001;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
