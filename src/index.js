import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./components/auth/AuthContext";
import "./index.css"; // Ensure styles are loaded

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter> 
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
