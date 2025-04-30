import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ user: null, token: null });
  const [loading, setLoading] = useState(true); // Block redirects until this is false

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:5001/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAuth({ user: res.data.user, token });
        localStorage.setItem("auth", JSON.stringify({ user: res.data.user, token }));
      })
      .catch(() => {
        localStorage.removeItem("auth");
        localStorage.removeItem("token");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:5001/auth/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("auth", JSON.stringify({ user, token }));
      localStorage.setItem("token", token);
      setAuth({ user, token });
      return true;
    } catch (err) {
      console.error("❌ Login failed:", err);
      return false;
    }
  };

  const logout = () => {
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
