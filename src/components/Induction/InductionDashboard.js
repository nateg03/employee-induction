import React, { useState, useEffect, useContext } from "react";
import DocumentList from "./DocumentList";
import ProgressTracker from "./ProgressTracker";
import { AuthContext } from "../auth/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function InductionDashboard({ logout }) {
  const { auth } = useContext(AuthContext);
  const [progress, setProgress] = useState(0);
  const [readDocuments, setReadDocuments] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.user) {
        navigate("/login");
        return;
    }

    if (auth.user.role === "admin") {
        navigate("/admin-dashboard");
        return;
    }

    console.log("🟢 Fetching progress for user:", auth.user.id);

    axios.get(`http://localhost:5001/auth/get-progress/${auth.user.id}`, {
        headers: { Authorization: auth.token },
    })
    .then(res => {
        if (res.data) {
            console.log("✅ Progress Data:", res.data);
            setReadDocuments(res.data);
            updateProgress(res.data);
        } else {
            console.log("⚠️ No progress data found.");
        }
    })
    .catch(err => console.error("❌ Error loading progress:", err));
}, [auth, navigate]);


  const updateProgress = (docs) => {
    const totalDocs = 5;
    const readCount = Object.values(docs || {}).filter((val) => val).length;
    setProgress((readCount / totalDocs) * 100);
  };

  const toggleReadStatus = (docId) => {
    const updatedReadDocuments = { ...readDocuments, [docId]: !readDocuments[docId] };
    setReadDocuments(updatedReadDocuments);
    updateProgress(updatedReadDocuments);

    console.log("📤 Sending Progress Data:", updatedReadDocuments);

    axios.post("http://localhost:5001/auth/save-progress", {
      userId: auth.user.id,
      readDocuments: updatedReadDocuments,
    }, {
      headers: { Authorization: auth.token },
    })
    .then(() => console.log("✅ Progress saved"))
    .catch(err => console.error("❌ Progress Save Error:", err));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">🚀 Induction Portal</h1>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg">
          Logout
        </button>
      </div>

      <ProgressTracker progress={progress} />
      <DocumentList toggleReadStatus={toggleReadStatus} readDocuments={readDocuments} />
    </div>
  );
}
