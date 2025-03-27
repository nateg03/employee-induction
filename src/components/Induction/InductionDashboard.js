import React, { useState, useEffect, useContext } from "react";
import DocumentList from "./DocumentList";
import ProgressTracker from "./ProgressTracker";
import { AuthContext } from "../auth/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaBookOpen, FaUser, FaChartPie } from "react-icons/fa";

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
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-gray-800 text-gray-200 p-6 flex flex-col justify-between shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-blue-400 flex items-center">
            <FaBookOpen className="mr-2" /> Induction
          </h1>
          <div className="mt-6 flex flex-col space-y-2">
            <p className="text-gray-400 text-sm flex items-center">
              <FaUser className="mr-2" /> {auth.user?.username}
            </p>
            <p className="text-gray-400 text-sm flex items-center">
              <FaChartPie className="mr-2" /> {progress.toFixed(0)}% Complete
            </p>
          </div>
        </div>
        <button
          onClick={() => logout(navigate)}
          className="mt-auto bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg flex items-center transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <FaSignOutAlt className="mr-2" /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COMPACT PROGRESS TRACKER */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-t-4 border-blue-500 w-full max-w-md mx-auto">
            <h2 className="text-md font-semibold text-gray-700 dark:text-gray-200 flex items-center">
              <FaChartPie className="mr-2 text-blue-500" /> Your Progress
            </h2>
            <div className="flex flex-col items-center mt-2">
              <ProgressTracker progress={progress} />
              <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                {progress.toFixed(0)}% Complete
              </p>
            </div>
          </div>

          {/* DOCUMENT LIST */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-t-4 border-blue-500">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center">
              <FaBookOpen className="mr-2 text-blue-500" /> Induction Documents
            </h2>
            <DocumentList toggleReadStatus={toggleReadStatus} readDocuments={readDocuments} />
          </div>
        </div>
      </div>
    </div>
  );
}
