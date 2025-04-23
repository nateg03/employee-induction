import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../auth/AuthContext";
import { motion } from "framer-motion";

export default function Quiz() {
  const { auth } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState({ submitted: false, approved: false });
  const [message, setMessage] = useState("");

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:5001/quiz/typed-questions");
      setQuestions(res.data);
    } catch (err) {
      console.error("❌ Failed to load questions:", err);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/quiz/status/${auth.user.id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setStatus(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch quiz status:", err);
    }
  };

  const handleChange = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:5001/quiz/submit", {
        userId: auth.user.id,
        answers,
      }, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      setMessage("✅ Quiz submitted successfully! Your answers are now pending review.");
      fetchStatus();
    } catch (err) {
      console.error("❌ Quiz submission failed:", err);
      setMessage("❌ Submission failed. Please try again.");
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchStatus();
  }, [auth]);

  const safeAnswers = (val) => (val === undefined || val === null ? "" : val);

  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-400"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-bold text-[#003c64] mb-2">📋 Derwentwater Pavilion Induction Quiz</h2>
      <p className="text-sm text-gray-600 mb-4">
        Please answer all questions. Your answers will be reviewed by an administrator.
      </p>

      {status.submitted ? (
        <div className="text-sm text-gray-700">
          ✅ You’ve submitted your answers. Status:{" "}
          <strong>{status.approved ? "Approved" : "Pending review"}</strong>
        </div>
      ) : (
        <>
          {questions.map((q, index) => (
            <div key={q.id} className="mb-4">
              <p className="font-medium mb-2">{index + 1}. {q.question}</p>
              <textarea
                rows="3"
                className="w-full p-2 border rounded"
                value={safeAnswers(answers[q.id])}
                onChange={(e) => handleChange(q.id, e.target.value)}
                placeholder="Type your answer here..."
              />
            </div>
          ))}
          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
          >
            Submit Quiz
          </button>
          {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
        </>
      )}
    </motion.div>
  );
}
