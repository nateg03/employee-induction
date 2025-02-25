import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export default function Login() {
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const res = await axios.post("http://localhost:5001/auth/login", { email, password });

        console.log("✅ Login Response:", res.data); // ✅ Debugging Log

        if (res.data.token) {
            localStorage.setItem("token", res.data.token); // ✅ Store token properly
            localStorage.setItem("userRole", res.data.user.role); // ✅ Store user role

            setAuth(res.data); // ✅ Update Context

            if (res.data.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/induction");
            }
        } else {
            setError("⚠️ Login failed: No token received.");
        }
    } catch (err) {
        console.error("❌ Login Error:", err.response?.data?.error || err.message);
        setError("Invalid email or password.");
    }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 w-full mb-4" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 w-full mb-4" />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Login</button>
      </form>
    </div>
  );
}
