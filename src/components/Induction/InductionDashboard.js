import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import DocumentList from "./DocumentList";
import ProgressTracker from "./ProgressTracker";
import axios from "axios";

export default function InductionDashboard() {
  const { auth, logout } = useContext(AuthContext);
  const [progress, setProgress] = useState(0);
  const [readDocuments, setReadDocuments] = useState({});

  useEffect(() => {
    if (!auth?.user) return;

    axios
      .get(`http://localhost:5001/auth/get-progress/${auth.user.id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((res) => {
        if (res.data) {
          console.log("✅ Progress Loaded:", res.data);
          setReadDocuments(res.data);
          updateProgress(res.data);
        }
      })
      .catch((err) => console.error("❌ Error loading progress:", err));
  }, [auth]);

  const updateProgress = (docs) => {
    const totalDocs = 5;
    const readCount = Object.values(docs || {}).filter((val) => val).length;
    setProgress((readCount / totalDocs) * 100);
  };

  const toggleReadStatus = (docId) => {
    const updatedReadDocuments = { ...readDocuments, [docId]: !readDocuments[docId] };
    setReadDocuments(updatedReadDocuments);
    updateProgress(updatedReadDocuments);

    axios
      .post(
        "http://localhost:5001/auth/save-progress",
        {
          userId: auth.user.id,
          readDocuments: updatedReadDocuments,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      )
      .then(() => console.log("✅ Progress saved"))
      .catch((err) => console.error("❌ Progress Save Error:", err));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">📖 Induction Portal</h1>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg">Logout</button>
      </div>
      <ProgressTracker progress={progress} />
      <DocumentList toggleReadStatus={toggleReadStatus} readDocuments={readDocuments} />
    </div>
  );
}
