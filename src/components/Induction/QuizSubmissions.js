import React, { useEffect, useState } from "react";
import axios from "axios";

export default function QuizSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get("http://localhost:5001/quiz/submissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch quiz submissions:", err);
    }
  };

  const handleApprove = async (submissionId) => {
    const isApproved = submissions.find((s) => s.id === submissionId)?.approved;
    const endpoint = isApproved ? "unapprove" : "approve";

    try {
      await axios.post(`http://localhost:5001/quiz/${endpoint}/${submissionId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(isApproved ? "🗑️ Submission unapproved" : "✅ Submission approved");
      fetchSubmissions();
    } catch (err) {
      console.error("❌ Approval toggle failed:", err);
      setMessage("❌ Failed to update approval");
    }
  };

  const deleteSubmission = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/quiz/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("🗑️ Submission deleted");
      fetchSubmissions();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      setMessage("❌ Failed to delete");
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-400">
      <h2 className="text-lg font-bold text-[#003c64] mb-4">📋 Quiz Submissions</h2>
      {message && <p className="text-sm text-center text-blue-600 mb-4">{message}</p>}

      {submissions.length === 0 ? (
        <p className="text-gray-500 text-sm">No submissions yet.</p>
      ) : (
        submissions.map((submission) => {
          const parsedAnswers =
            typeof submission.answers === "string"
              ? JSON.parse(submission.answers)
              : submission.answers;

          return (
            <div key={submission.id} className="bg-gray-50 border rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-semibold">{submission.username}</p>
                  <p className="text-sm text-gray-500">{submission.email}</p>
                  <p className="text-xs text-gray-400">
                    Submitted: {new Date(submission.submitted_at).toLocaleString()}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleApprove(submission.id)}
                    className={`text-white px-3 py-1 rounded ${
                      submission.approved
                        ? "bg-gray-400 hover:bg-gray-500"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {submission.approved ? "Unapprove" : "Approve"}
                  </button>

                  <button
                    onClick={() => deleteSubmission(submission.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-3 mt-3">
                {Object.entries(parsedAnswers).map(([index, answer], i) => (
                  <div key={i}>
                    <p className="font-medium text-gray-700">Q{i + 1}:</p>
                    <p className="text-sm bg-white border border-gray-300 rounded p-2 text-gray-800 whitespace-pre-wrap">
                      {answer || "(No answer submitted)"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
