import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const storedAuth = localStorage.getItem("auth");
    return storedAuth ? JSON.parse(storedAuth) : { user: null, token: null };
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.user) {
      console.log("⚠️ No user found, redirecting to login...");
      navigate("/login");
    }
  }, [auth, navigate]);

  const login = (userData) => {
    console.log("✅ User Logged In:", userData);
    setAuth(userData);
    localStorage.setItem("auth", JSON.stringify(userData));

    if (userData.user.role === "admin") {
      navigate("/admin"); // ✅ Redirect to Admin Dashboard
    } else {
      navigate("/induction"); // ✅ Redirect to Employee Dashboard
    }
  };

  const logout = () => {
    console.log("🔴 Logging out...");
    setAuth({ user: null, token: null });
    localStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
