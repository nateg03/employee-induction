import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";  // ✅ Fix import path
import InductionDashboard from "./components/Induction/InductionDashboard";  // ✅ Fix import path
import { AuthContext } from "./components/auth/AuthContext";  // ✅ Fix import path



export default function App() {
  const { auth, setAuth } = useContext(AuthContext);

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setAuth(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!auth ? <Login /> : <Navigate to="/induction" />} />
        <Route path="/induction" element={auth ? <InductionDashboard logout={logout} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={auth ? "/induction" : "/login"} />} />
      </Routes>
    </Router>
  );
}
