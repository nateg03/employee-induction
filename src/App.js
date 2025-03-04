import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./components/auth/AuthContext";
import Login from "./components/auth/Login";
import AdminDashboard from "./components/Induction/AdminDashboard";
import InductionDashboard from "./components/Induction/InductionDashboard";

function ProtectedRoute({ children, role }) {
  const { auth } = useContext(AuthContext);
  
  if (!auth.user) return <Navigate to="/login" />;
  if (role && auth.user.role !== role) return <Navigate to="/" />;
  
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/induction" element={<ProtectedRoute><InductionDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/induction" />} />
    </Routes>
  );
}
