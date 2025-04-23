// InductionDashboard.js — Final Version with Progress Capped at 100%
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../auth/AuthContext";
import ProgressTracker from "./ProgressTracker";
import { useNavigate } from "react-router-dom";
import Quiz from "./Quiz";
import { FaSignOutAlt, FaBookOpen, FaCloud } from "react-icons/fa";

export default function InductionDashboard() {
  const { auth, logout } = useContext(AuthContext);
  const [readDocuments, setReadDocuments] = useState({});
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const fetchProgress = async () => {
    if (!auth?.user) return;

    try {
      const [docRes, progRes] = await Promise.all([
        axios.get(`http://localhost:5001/auth/get-progress/${auth.user.id}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }),
        axios.get(`http://localhost:5001/auth/progress-percent/${auth.user.id}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }),
      ]);

      setReadDocuments(docRes.data || {});
      const cappedProgress = Math.min(progRes.data.progress || 0, 100);
      setProgress(cappedProgress);
    } catch (err) {
      console.error("❌ Failed to load progress:", err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await axios.get("http://localhost:5001/documents");
      setDocuments(res.data);
    } catch (err) {
      console.error("❌ Failed to load documents:", err);
    }
  };

  useEffect(() => {
    if (auth?.user?.role === "admin") {
      navigate("/admin");
    }
  }, [auth, navigate]);

  useEffect(() => {
    fetchDocuments();
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  const toggleReadStatus = (filename) => {
    const updated = { ...readDocuments, [filename]: !readDocuments[filename] };
    setReadDocuments(updated);

    axios
      .post(
        "http://localhost:5001/auth/save-progress",
        { userId: auth.user.id, readDocuments: updated },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )
      .then(() => fetchProgress())
      .catch((err) => console.error("❌ Failed to save progress:", err));
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-gray-800">
      <header className="bg-[#003c64] text-white p-6 shadow flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaBookOpen className="text-blue-300" /> Induction Dashboard
        </h1>
        <button
          onClick={() => logout(navigate)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FaSignOutAlt /> Logout
        </button>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-10">
        <ProgressTracker progress={progress} />

        <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6 mt-6">
          <div className="bg-white p-5 rounded-lg shadow border-t-4 border-blue-400 max-h-[calc(100vh-250px)] overflow-y-auto">
            <h2 className="text-xl font-semibold text-[#003c64] mb-4">📚 Induction Documents</h2>
            <ul className="space-y-3">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className={`p-3 rounded border cursor-pointer shadow-sm hover:shadow transition ${
                    selectedDoc?.id === doc.id ? "bg-blue-100 border-blue-500" : "bg-gray-50"
                  }`}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{doc.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReadStatus(doc.filename);
                      }}
                      className={`text-xs font-semibold px-4 py-1 rounded-full transition-all duration-300 transform ${
                        readDocuments[doc.filename]
                          ? "bg-gradient-to-r from-green-400 to-green-600 text-white border border-green-600 hover:scale-105"
                          : "bg-gradient-to-r from-blue-400 to-blue-600 text-white border border-blue-600 hover:scale-105"
                      }`}
                    >
                      {readDocuments[doc.filename] ? "✓ Mark Unread" : "📘 Mark as Read"}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    {readDocuments[doc.filename] ? "✅ Read" : "📄 Unread"}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow border-t-4 border-blue-400 p-5">
            {selectedDoc ? (
              <>
                <h3 className="text-lg font-bold text-[#003c64] mb-3">{selectedDoc.title}</h3>
                <iframe
                  src={`http://localhost:5001/uploads/${selectedDoc.filename}`}
                  className="w-full h-[850px] border rounded shadow-lg"
                  title={selectedDoc.title}
                />
              </>
            ) : (
              <div className="text-gray-500 text-center h-[850px] flex items-center justify-center">
                Select a document to view it
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-400 flex flex-col items-center text-center">
            <FaCloud className="text-4xl text-blue-500 mb-2" />
            <h3 className="text-lg font-semibold mb-1 text-[#003c64]">BreatheHR Integration</h3>
            <p className="text-sm text-gray-600">Coming soon! This section will connect to BreatheHR.</p>
          </div>
          <Quiz />
        </div>
      </main>
    </div>
  );
}
