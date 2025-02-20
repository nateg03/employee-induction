import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");
    return token && user ? { token, user: JSON.parse(user) } : null;
  });

  useEffect(() => {
    if (auth) {
      localStorage.setItem("authToken", auth.token);
      localStorage.setItem("user", JSON.stringify(auth.user));
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }
  }, [auth]);

  return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>;
};
