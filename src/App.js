import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import InductionDashboard from "./components/Induction/InductionDashboard";
import AdminDashboard from "./components/Induction/AdminDashboard";
import { AuthProvider } from "./components/auth/AuthContext";
import axios from "axios";

export default function App() {
  const [auth, setAuth] = useState(() => {
    const savedAuth = localStorage.getItem("auth");
    return savedAuth ? JSON.parse(savedAuth) : { user: null, token: null };
  });

  useEffect(() => {
    const token = auth?.token;
    if (token) {
      axios.get("http://localhost:5001/auth/me", { headers: { Authorization: token } })
        .then(res => setAuth(prev => ({ ...prev, user: res.data })))
        .catch(() => {
          localStorage.removeItem("auth");
          setAuth({ user: null, token: null });
        });
    }
  }, []);

  const logout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem("auth");
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={auth.user ? <Navigate to="/induction" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/induction" element={auth.user ? <InductionDashboard logout={logout} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={auth.user?.role === "admin" ? <AdminDashboard logout={logout} /> : <Navigate to="/login" />} />
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
