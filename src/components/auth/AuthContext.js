import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("⚠️ No token found, staying on page.");
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:5001/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAuth({ user: res.data.user, token });
        console.log("✅ Session restored:", res.data.user);
      })
      .catch((err) => {
        console.error("⚠️ Session expired, logging out...", err);
        logout();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData) => {
    console.log("✅ User Logged In:", userData);
    localStorage.setItem("auth", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
    setAuth(userData);
  };

  const logout = () => {
    console.log("🔴 Logging out...");
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    setAuth({ user: null, token: null });
    window.location.href = "/login";
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
