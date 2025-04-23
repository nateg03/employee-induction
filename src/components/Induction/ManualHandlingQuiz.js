import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../auth/AuthContext";
import { motion } from "framer-motion";

export default function ManualHandlingQuiz() {
  const { auth } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState({ submitted: false, approved: false });
  const [message, setMessage] = useState("");

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5001/quiz/manual-handling");
      setQuestions(res.data);
    } catch (err) {
      console.error("❌ Failed to load MH questions", err);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5001/quiz/manual-handling/status/${auth.user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus(res.data);
    } catch (err) {
      console.error("❌ Failed to load MH quiz status", err);
    }
  }, [auth.user.id]);

  useEffect(() => {
    fetchQuestions();
    fetchStatus();
  }, [fetchQuestions, fetchStatus]);

  const handleSingleSelect = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleMultiSelect = (qId, value) => {
    const prev = answers[qId] || [];
    const updated = prev.includes(value)
      ? prev.filter((v) => v !== value)
      : [...prev, value];
    setAnswers((prev) => ({ ...prev, [qId]: updated }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5001/quiz/manual-handling/submit",
        { userId: auth.user.id, answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Quiz submitted successfully!");
      fetchStatus();
    } catch (err) {
      console.error("❌ Failed to submit MH quiz", err);
      setMessage("❌ Submission failed.");
    }
  };

  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-500"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-bold text-[#003c64] mb-2">🦺 Manual Handling Training 2024 Quiz</h2>
      <p className="text-sm text-gray-600 mb-4">
        Please answer all questions carefully. Once submitted, your answers will be reviewed by an admin.
      </p>

      {!status.submitted ? (
        <>
          {questions.map((q, index) => (
            <div key={q.id} className="mb-4">
              <p className="font-medium mb-2">{index + 1}. {q.question}</p>
              <div className="space-y-2 pl-4">
                {["A", "B", "C", "D"].map((opt) => {
                  const label = q[`option_${opt.toLowerCase()}`];
                  if (!label) return null;

                  // Q1 is multiple select
                  const isMulti = index === 0;
                  const checked = isMulti
                    ? (answers[q.id] || []).includes(opt)
                    : answers[q.id] === opt;

                  return (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type={isMulti ? "checkbox" : "radio"}
                        name={`question-${q.id}`}
                        value={opt}
                        checked={checked}
                        onChange={() =>
                          isMulti
                            ? handleMultiSelect(q.id, opt)
                            : handleSingleSelect(q.id, opt)
                        }
                        className="accent-yellow-500"
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          <button
            onClick={handleSubmit}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-semibold"
          >
            Submit Quiz
          </button>
          {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
        </>
      ) : (
        <div className="text-sm text-gray-700">
          ✅ You’ve submitted your answers. Status:{" "}
          <strong>{status.approved ? "Approved" : "Pending review"}</strong>
        </div>
      )}
    </motion.div>
  );
}
