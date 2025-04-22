import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../auth/AuthContext";

const questions = [
  "What are the fire safety procedures at the Pavilion?",
  "Who is your appointed supervisor?",
  "What PPE must you wear while on site?",
  "What should you do if you identify a hazard?",
  "Where is the nearest fire exit from your workstation?",
];

export default function Quiz() {
  const { auth } = useContext(AuthContext);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (index, value) => {
    setAnswers({ ...answers, [index]: value });
  };

  const handleSubmit = async () => {
    if (!auth || !auth.user) return;

    try {
      await axios.post(
        "http://localhost:5001/quiz/submit",
        {
          userId: auth.user.id,
          answers,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setSubmitted(true);
    } catch (err) {
      console.error("❌ Submit error:", err);
      setError("Failed to submit. Try again.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-400">
      <h2 className="text-lg font-bold text-[#003c64] mb-4">📝 Site Induction Quiz</h2>
      {submitted ? (
        <div className="text-green-600 font-semibold">✅ Your answers have been submitted for review!</div>
      ) : (
        <>
          {questions.map((q, i) => (
            <div key={i} className="mb-4">
              <label className="block font-semibold text-gray-700 mb-1">{q}</label>
              <textarea
                className="w-full p-2 border rounded bg-gray-50"
                rows={3}
                value={answers[i] || ""}
                onChange={(e) => handleChange(i, e.target.value)}
                placeholder="Type your answer here..."
              />
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Submit Answers
          </button>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </>
      )}
    </div>
  );
}
