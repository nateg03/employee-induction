import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../auth/AuthContext";
import ProgressTracker from "./ProgressTracker";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaBookOpen, FaUser, FaChartPie } from "react-icons/fa";

export default function InductionDashboard() {
  const { auth, logout } = useContext(AuthContext);
  const [readDocuments, setReadDocuments] = useState({});
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  // Fetch documents
  useEffect(() => {
    axios
      .get("http://localhost:5001/documents")
      .then((res) => setDocuments(res.data))
      .catch((err) => console.error("❌ Failed to load documents:", err));
  }, []);

  // Fetch progress
  useEffect(() => {
    if (!auth?.user) return;
    if (auth.user.role === "admin") {
      navigate("/admin");
      return;
    }

    axios
      .get(`http://localhost:5001/auth/get-progress/${auth.user.id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((res) => setReadDocuments(res.data || {}))
      .catch((err) => console.error("❌ Failed to load progress:", err));
  }, [auth, navigate]);

  // Update progress based on read documents
  useEffect(() => {
    const readCount = Object.values(readDocuments).filter(Boolean).length;
    const totalCount = documents.length || 1;
    setProgress((readCount / totalCount) * 100);
  }, [readDocuments, documents]);

  const toggleReadStatus = (filename) => {
    const updated = { ...readDocuments, [filename]: !readDocuments[filename] };
    setReadDocuments(updated);

    axios
      .post(
        "http://localhost:5001/auth/save-progress",
        {
          userId: auth.user.id,
          readDocuments: updated,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      )
      .then(() => console.log("✅ Progress saved"))
      .catch((err) => console.error("❌ Failed to save progress:", err));
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* SIDEBAR */}
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

      {/* MAIN */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Tracker */}
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

          {/* Document List */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-t-4 border-blue-500">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
              <FaBookOpen className="mr-2 text-blue-500" /> Induction Documents
            </h2>
            <ul className="space-y-3">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-lg shadow cursor-pointer hover:shadow-md"
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{doc.title}</p>
                    <p className="text-sm text-gray-500">
                      {readDocuments[doc.filename] ? "✅ Read" : "📄 Unread"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleReadStatus(doc.filename);
                    }}
                    className={`px-3 py-1 rounded text-white ${
                      readDocuments[doc.filename] ? "bg-green-500" : "bg-blue-500"
                    } hover:opacity-90`}
                  >
                    {readDocuments[doc.filename] ? "Mark Unread" : "Mark Read"}
                  </button>
                </li>
              ))}
            </ul>

            {selectedDoc && (
              <div className="mt-6">
                <h3 className="text-md font-bold text-blue-500 mb-2">
                  Viewing: {selectedDoc.title}
                </h3>
                <iframe
                  src={`http://localhost:5001/uploads/${selectedDoc.filename}`}
                  className="w-full h-[600px] border rounded shadow"
                  title={selectedDoc.title}
                ></iframe>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
