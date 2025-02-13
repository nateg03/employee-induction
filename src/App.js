import React, { useEffect, useState, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import InductionDashboard from "./components/Induction/InductionDashboard";
import AdminDashboard from "./components/Induction/AdminDashboard";
import { AuthProvider, AuthContext } from "./components/auth/AuthContext";
import axios from "axios";

function App() {
  const { auth, setAuth } = useContext(AuthContext);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.get("http://localhost:5001/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setAuth({ user: res.data, token }))
      .catch(() => {
        localStorage.removeItem("token");
        setAuth({ user: null, token: null });
      });
    }
  }, [setAuth]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={auth.user ? <Navigate to="/induction" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/induction" element={auth.user ? <InductionDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin" element={auth.user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default function WrappedApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
