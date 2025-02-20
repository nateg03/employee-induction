import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { setAuth } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message

    try {
      console.log("🔵 Logging in with:", email, password);
      const res = await axios.post("http://localhost:5001/auth/login", { email, password });
      console.log("✅ API Response:", res.data);

      if (res.data.token && res.data.user) {
        localStorage.setItem("authToken", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setAuth({ token: res.data.token, user: res.data.user });

        console.log("✅ Storing in LocalStorage:", res.data);
        navigate("/induction");
      } else {
        setError("Invalid login response from server.");
      }
    } catch (err) {
      console.error("❌ Login Error:", err.response?.data?.error || err.message);
      setError(err.response?.data?.error || "Login failed.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
