import React, { useState, useEffect, useContext } from "react";
import DocumentList from "./DocumentList";
import ProgressTracker from "./ProgressTracker";
import { AuthContext } from "../auth/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function InductionDashboard() {
  const { auth, setAuth } = useContext(AuthContext);
  const [progress, setProgress] = useState(0);
  const [readDocuments, setReadDocuments] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.user) {
      navigate("/login");
      return;
    }

    axios
      .get(`http://localhost:5001/get-progress/${auth.user.id}`, {
        headers: { Authorization: auth.token },
      })
      .then((res) => {
        setReadDocuments(res.data || {});
        updateProgress(res.data);
      })
      .catch((err) => console.error("Error loading progress:", err));
  }, [auth, navigate]);

  const updateProgress = (docs) => {
    const totalDocs = 5;
    const readCount = Object.values(docs || {}).filter((val) => val).length;
    setProgress((readCount / totalDocs) * 100);
  };

  // ✅ Define toggleReadStatus function correctly
  const toggleReadStatus = (docId) => {
    console.log("Toggling Read Status for Doc:", docId);
    
    // ✅ Ensure `readDocuments` exists
    const updatedReadDocuments = { ...readDocuments, [docId]: !readDocuments[docId] };
    setReadDocuments(updatedReadDocuments);
    updateProgress(updatedReadDocuments);

    axios
      .post(
        "http://localhost:5001/save-progress",
        {
          userId: auth.user.id,
          readDocuments: updatedReadDocuments,
        },
        {
          headers: { Authorization: auth.token },
        }
      )
      .catch((err) => console.error("Error saving progress:", err));
  };

  const handleLogout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">🚀 Induction Portal</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg">
          Logout
        </button>
      </div>

      <ProgressTracker progress={progress} />

      {/* ✅ Pass toggleReadStatus as a prop */}
      <DocumentList toggleReadStatus={toggleReadStatus} readDocuments={readDocuments} />
    </div>
  );
}
