const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'admin_nate',  // ✅ Your MySQL username
    password: 'Pennywise!1',  // ✅ Your new password
    database: 'induction'  // ✅ Your database name
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('❌ MySQL Connection Failed:', err.message);
    } else {
        console.log('✅ MySQL Database Connected!');
    }
});

module.exports = db;
