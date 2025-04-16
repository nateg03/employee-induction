import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../auth/AuthContext";
import ProgressTracker from "./ProgressTracker";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaBookOpen, FaUser, FaChartPie } from "react-icons/fa";
import { motion } from "framer-motion";

export default function InductionDashboard() {
  const { auth, logout } = useContext(AuthContext);
  const [readDocuments, setReadDocuments] = useState({});
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5001/documents")
      .then((res) => setDocuments(res.data))
      .catch((err) => console.error("❌ Failed to load documents:", err));
  }, []);

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
    <div className="min-h-screen bg-[#f4f7fa] text-gray-900">
      {/* HEADER */}
      <header className="bg-[#003c64] text-white py-4 shadow-md flex items-center justify-between px-6">
        <h1 className="text-2xl font-bold flex items-center">
          <FaBookOpen className="mr-3 text-[#97d0ff]" />
          Induction Dashboard
        </h1>
        <button
          onClick={() => logout(navigate)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
        >
          <FaSignOutAlt /> Logout
        </button>
      </header>

      {/* MAIN */}
      <main className="p-6 max-w-7xl mx-auto space-y-10">
        {/* PROGRESS */}
        <motion.section
          className="bg-white rounded-lg shadow-md border-t-4 border-[#0074cc] p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-semibold text-[#003c64] mb-2 flex items-center">
            <FaChartPie className="mr-2" />
            Your Progress
          </h2>
          <div className="flex flex-col items-center mt-2">
            <ProgressTracker progress={progress} />
            <p className="text-sm mt-2 text-gray-600">{progress.toFixed(0)}% Complete</p>
          </div>
        </motion.section>

        {/* DOCUMENT SELECTOR */}
        <motion.section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {documents.map((doc) => {
            const isRead = readDocuments[doc.filename];
            const isSelected = selectedDoc?.id === doc.id;

            return (
              <motion.div
                key={doc.id}
                whileHover={{ scale: 1.03 }}
                className={`rounded-lg shadow-md p-5 cursor-pointer transition-all duration-300 ${
                  isSelected ? "border-4 border-[#0074cc] bg-[#e6f1fb]" : "bg-white border"
                }`}
                onClick={() => setSelectedDoc(doc)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-[#003c64] text-lg">{doc.title}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isRead ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {isRead ? "Read" : "Unread"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{doc.filename}</p>
              </motion.div>
            );
          })}
        </motion.section>

        {/* PDF VIEWER */}
        {selectedDoc && (
          <motion.section
            className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-[#0074cc]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[#003c64]">
                Viewing: {selectedDoc.title}
              </h3>
              <button
                onClick={() => toggleReadStatus(selectedDoc.filename)}
                className={`px-4 py-2 text-white rounded shadow ${
                  readDocuments[selectedDoc.filename]
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {readDocuments[selectedDoc.filename] ? "Mark as Unread" : "Mark as Read"}
              </button>
            </div>
            <div className="overflow-hidden rounded border shadow">
              <iframe
                src={`http://localhost:5001/uploads/${selectedDoc.filename}`}
                className="w-full h-[90vh]"
                title={selectedDoc.title}
              ></iframe>
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
