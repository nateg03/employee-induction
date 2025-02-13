import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";  // ✅ Ensures Tailwind CSS loads
import { AuthProvider } from "./components/auth/AuthContext"; // ✅ Ensure correct import

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ Wrap the entire app */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
