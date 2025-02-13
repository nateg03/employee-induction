require("dotenv").config();
const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// Define User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: { type: String, enum: ["employee", "admin"], default: "employee" },
});

const User = mongoose.model("User", UserSchema);

// Function to Delete Admin User
async function deleteAdmin() {
  const result = await User.deleteOne({ email: "admin.nate@c-oms.co.uk" });

  if (result.deletedCount > 0) {
    console.log("✅ Admin user deleted successfully!");
  } else {
    console.log("⚠️ No admin user found with that email.");
  }

  mongoose.connection.close();
}

deleteAdmin();
