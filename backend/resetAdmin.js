const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const db = new sqlite3.Database("induction.sqlite", (err) => {
  if (err) {
    console.error("❌ Error opening database:", err.message);
    return;
  }
  console.log("✅ Connected to SQLite Database");
});

// 🔥 Delete existing admin user
db.run("DELETE FROM users WHERE email = ?", ["admin.nate@c-oms.co.uk"], function (err) {
  if (err) {
    console.error("❌ Error deleting admin:", err.message);
  } else {
    console.log("✅ Admin user deleted successfully!");
  }

  // 🔥 Create a new admin user with a hashed password
  const hashedPassword = bcrypt.hashSync("n!n3r3dmonk3ys!", 10);
  db.run(
    "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
    ["COMSAdmin", "admin.nate@c-oms.co.uk", hashedPassword, "admin"],
    function (err) {
      if (err) {
        console.error("❌ Error inserting admin user:", err.message);
      } else {
        console.log("✅ Admin user created successfully!");
      }
      db.close();
    }
  );
});
