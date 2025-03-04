import React, { useState, useEffect, useContext } from "react";
import DocumentList from "./DocumentList";
import ProgressTracker from "./ProgressTracker";
import { AuthContext } from "../auth/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaBookOpen } from "react-icons/fa";

export default function InductionDashboard() {
  const { auth, logout } = useContext(AuthContext);
  const [progress, setProgress] = useState(0);
  const [readDocuments, setReadDocuments] = useState({});
  const navigate = useNavigate();
  const totalDocuments = 5;

  useEffect(() => {
    if (!auth?.user) {
      console.log("⚠️ No user found, but waiting for auth state...");
      return;
    }

    if (auth.user.role === "admin") {
      navigate("/admin");
      return;
    }

    console.log("🟢 Fetching progress for user:", auth.user.id);

    axios
      .get(`http://localhost:5001/auth/get-progress/${auth.user.id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((res) => {
        if (res.data) {
          console.log("✅ Progress Data:", res.data);
          setReadDocuments(res.data);
          updateProgress(res.data);
        } else {
          console.log("⚠️ No progress data found.");
        }
      })
      .catch((err) => console.error("❌ Error loading progress:", err));
  }, [auth, navigate]);

  const updateProgress = (docs) => {
    const readCount = Object.values(docs || {}).filter((val) => val).length;
    setProgress((readCount / totalDocuments) * 100);
  };

  const toggleReadStatus = (docId) => {
    const updatedReadDocuments = { ...readDocuments, [docId]: !readDocuments[docId] };
    setReadDocuments(updatedReadDocuments);
    updateProgress(updatedReadDocuments);

    console.log("📤 Sending Progress Data:", updatedReadDocuments);

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-10 flex flex-col">
      <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 shadow-lg p-4 rounded-lg border border-gray-300">
        <h1 className="text-3xl font-bold flex items-center text-blue-600 dark:text-blue-400">
          <FaBookOpen className="mr-3" /> Induction Portal
        </h1>
        <button
          onClick={() => logout(navigate)}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg flex items-center transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <FaSignOutAlt className="mr-2" /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-t-4 border-blue-500">
          <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Your Progress</h2>
          <ProgressTracker progress={progress} />
          <p className="text-center mt-3 text-gray-600 dark:text-gray-400">
            {progress.toFixed(0)}% Complete
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-t-4 border-blue-500">
          <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Induction Documents</h2>
          <DocumentList toggleReadStatus={toggleReadStatus} readDocuments={readDocuments} />
        </div>
      </div>
    </div>
  );
}
