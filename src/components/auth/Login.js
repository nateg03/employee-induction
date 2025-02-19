import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function Login() {
  const { auth, setAuth } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🟢 Check if user is already logged in and redirect to dashboard
  useEffect(() => {
    if (auth.user) {
      navigate("/induction", { replace: true });
    }
  }, [auth.user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear errors

    try {
      const res = await axios.post("http://localhost:5001/auth/login", { email, password });

      console.log("🔵 API Response:", res.data);

      if (res.data.token) {
        console.log("✅ Storing auth data in localStorage");
        localStorage.setItem("auth", JSON.stringify(res.data));

        setAuth(res.data); // Update global auth state
        console.log("✅ Redirecting to /induction...");
        navigate("/induction", { replace: true });
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("🔴 Login Error:", err.response?.data || err.message);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-3 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-3 border rounded"
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
