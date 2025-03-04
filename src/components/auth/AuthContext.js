import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    try {
      const storedAuth = localStorage.getItem("auth");
      return storedAuth ? JSON.parse(storedAuth) : { user: null, token: null };
    } catch (error) {
      console.error("❌ Error parsing auth data:", error);
      return { user: null, token: null };
    }
  });

  useEffect(() => {
    console.log("🔄 Checking user session...");
  }, []); // ✅ This ensures no unnecessary re-renders

  const login = (userData) => {
    console.log("✅ User Logged In:", userData);
    setAuth(userData);
    localStorage.setItem("auth", JSON.stringify(userData));
  };

  const logout = () => {
    console.log("🔴 Logging out...");
    localStorage.removeItem("auth");
    setAuth({ user: null, token: null });
    window.location.href = "/login"; // ✅ Forces full refresh to clear session
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
