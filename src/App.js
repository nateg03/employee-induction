import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import InductionDashboard from "./components/Induction/InductionDashboard";
import AdminDashboard from "./components/Induction/AdminDashboard";
import { AuthProvider, AuthContext } from "./components/auth/AuthContext";
import axios from "axios";

function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

function App() {
  const { auth, setAuth } = useContext(AuthContext);

  // 🟢 Restore user session
  useEffect(() => {
    const savedAuth = localStorage.getItem("auth");
    if (savedAuth && !auth.user) {
      setAuth(JSON.parse(savedAuth));
    }
  }, [auth.user, setAuth]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={auth.user ? <Navigate to="/induction" /> : <Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/induction" element={auth.user ? <InductionDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin" element={auth.user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;
