const sqlite3 = require("sqlite3").verbose();

// Connect to the SQLite database
const db = new sqlite3.Database("induction.sqlite", (err) => {
  if (err) {
    console.error("❌ Error opening database:", err.message);
    return;
  }

  console.log("✅ Connected to SQLite Database");

  // Insert Admin User
  db.run(
    `INSERT INTO users (username, email, password, role) 
     VALUES (?, ?, ?, ?)`,
    ["COMSAdmin", "admin.nate@c-oms.co.uk", "n!n3r3dmonk3ys!", "admin"],
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
