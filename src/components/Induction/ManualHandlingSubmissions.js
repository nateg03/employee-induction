import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaTrashAlt } from "react-icons/fa";
import { motion } from "framer-motion";

export default function ManualHandlingSubmissions() {
  const [submissions, setSubmissions] = useState([]);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5001/quiz/manual-handling/submissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(res.data);
    } catch (err) {
      console.error("❌ Failed to load submissions:", err);
    }
  };

  const handleApprove = async (id) => {
    await axios.post(`http://localhost:5001/quiz/manual-handling/approve/${id}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    fetchSubmissions();
  };

  const handleUnapprove = async (id) => {
    await axios.post(`http://localhost:5001/quiz/manual-handling/unapprove/${id}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    fetchSubmissions();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5001/quiz/manual-handling/delete/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    fetchSubmissions();
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const safeParse = (json) => {
    try {
      return typeof json === "object" ? json : JSON.parse(json);
    } catch {
      return {};
    }
  };

  return (
    <motion.div className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-500 mt-6">
      <h2 className="text-xl font-bold text-[#003c64] mb-4">📝 Manual Handling Quiz Submissions</h2>
      {submissions.length === 0 ? (
        <p className="text-sm text-gray-500">No submissions yet.</p>
      ) : (
        submissions.map((sub) => {
          const parsed = safeParse(sub.answers);
          return (
            <motion.div
              key={sub.id}
              className="border rounded p-4 mb-6 shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-2 text-sm text-gray-700">
                <strong>{sub.username}</strong> ({sub.email}) —{" "}
                <span className="italic text-gray-500">{new Date(sub.submitted_at).toLocaleString()}</span>
              </div>

              <ul className="mb-3 space-y-1 text-sm text-gray-800">
                {Object.entries(parsed).map(([qId, answer]) => (
                  <li key={qId}>
                    <strong>Q{qId}</strong>: {answer}
                  </li>
                ))}
              </ul>

              <div className="flex gap-3">
                {!sub.approved ? (
                  <button
                    onClick={() => handleApprove(sub.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    <FaCheckCircle /> Approve
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnapprove(sub.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    <FaTimesCircle /> Unapprove
                  </button>
                )}
                <button
                  onClick={() => handleDelete(sub.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                  <FaTrashAlt /> Delete
                </button>
              </div>
            </motion.div>
          );
        })
      )}
    </motion.div>
  );
}
