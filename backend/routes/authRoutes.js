router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("🟡 Login Attempt:", email);

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ error: "Server error" });
        }
        if (results.length === 0) {
            console.log("❌ User not found:", email);
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("❌ Password incorrect for:", email);
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        console.log("✅ Login successful for:", email);
        res.json({ token, user });
    });
});
