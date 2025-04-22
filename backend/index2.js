require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./database");

const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const documentRoutes = require("./routes/documentRoutes");
const exportRoutes = require("./routes/exportRoutes");

const app = express(); // ✅ Make sure app is declared before any app.use()

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/quiz", quizRoutes); // ✅ Now it's in the correct place
app.use("/documents", documentRoutes);
app.use("/export", exportRoutes);

// ✅ Serve uploaded files
app.use("/uploads", express.static("uploads"));

// ✅ Start Server
const PORT = 5001;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
