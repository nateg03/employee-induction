const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("induction.sqlite", (err) => {
  if (err) {
    console.error("❌ Error opening database:", err.message);
  } else {
    console.log("✅ SQLite Database Connected!");

    // ✅ Create Users Table
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'employee')) NOT NULL DEFAULT 'employee'
      )`,
      () => console.log("✅ Users table ready")
    );

    // ✅ Create Read Progress Table
    db.run(
      `CREATE TABLE IF NOT EXISTS read_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        document_name TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      () => console.log("✅ Read Progress table ready")
    );
  }
});

module.exports = db;
