import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { AuthContext } from "../auth/AuthContext";

export default function ManualHandlingQuiz() {
  const { auth } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState({ submitted: false, approved: false });
  const [message, setMessage] = useState("");

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:5001/quiz/manual-handling");
      setQuestions(res.data);
    } catch (err) {
      console.error("❌ Failed to load MH questions", err);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/quiz/manual-handling/status/${auth.user.id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setStatus(res.data);
    } catch (err) {
      console.error("❌ Failed to load MH quiz status", err);
    }
  };

  const handleAnswerChange = (qId, value, isMultiSelect) => {
    setAnswers((prev) => {
      const current = prev[qId] || [];
      if (isMultiSelect) {
        return {
          ...prev,
          [qId]: current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value],
        };
      } else {
        return {
          ...prev,
          [qId]: value,
        };
      }
    });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        "http://localhost:5001/quiz/manual-handling/submit",
        { userId: auth.user.id, answers },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setMessage("✅ Manual Handling Quiz submitted successfully!");
      fetchStatus();
    } catch (err) {
      console.error("❌ Failed to submit MH quiz", err);
      setMessage("❌ Submission failed.");
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchStatus();
  }, []);

  return (
    <motion.div className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-500">
      <h2 className="text-xl font-bold text-[#003c64] mb-2">🦺 Manual Handling Training 2024 Quiz</h2>
      <p className="text-sm text-gray-600 mb-4">
        Please answer all questions carefully. Once submitted, your answers will be reviewed by an admin.
      </p>

      {status.submitted ? (
        <div className="text-sm text-gray-700">
          ✅ You’ve submitted your answers. Status:{" "}
          <strong>{status.approved ? "Approved" : "Pending review"}</strong>
        </div>
      ) : (
        <>
          {questions.map((q, index) => {
            const isMulti = q.correct_answer.includes(",");
            const selected = answers[q.id] || (isMulti ? [] : "");

            return (
              <div key={q.id} className="mb-5">
                <p className="font-medium mb-2">
                  {index + 1}. {q.question}
                </p>
                <div className="space-y-2 pl-4">
                  {["A", "B", "C", "D", "E"].map((optKey) => {
                    const optionText = q[`option_${optKey.toLowerCase()}`];
                    if (!optionText) return null;

                    const inputProps = {
                      type: isMulti ? "checkbox" : "radio",
                      name: `q-${q.id}`,
                      value: optKey,
                      checked: isMulti
                        ? selected.includes(optKey)
                        : selected === optKey,
                      onChange: () => handleAnswerChange(q.id, optKey, isMulti),
                      className: "accent-yellow-500",
                    };

                    return (
                      <label key={optKey} className="flex items-center gap-2 cursor-pointer">
                        <input {...inputProps} />
                        {optionText}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button
            onClick={handleSubmit}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-semibold"
          >
            Submit Quiz
          </button>

          {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
        </>
      )}
    </motion.div>
  );
}
