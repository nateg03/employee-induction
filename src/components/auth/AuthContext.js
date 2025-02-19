import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    try {
      const savedAuth = localStorage.getItem("auth");
      return savedAuth ? JSON.parse(savedAuth) : { user: null, token: null };
    } catch {
      return { user: null, token: null };
    }
  });

  // 🟢 Restore authentication from localStorage when the app loads
  useEffect(() => {
    if (!auth.user) {
      const savedAuth = localStorage.getItem("auth");
      if (savedAuth) {
        setAuth(JSON.parse(savedAuth));
      }
    }
  }, []);

  // 🟢 Sync `auth` state with `localStorage`
  useEffect(() => {
    if (auth.user) {
      localStorage.setItem("auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("auth");
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
