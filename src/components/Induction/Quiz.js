import React, { useState } from "react";
import { motion } from "framer-motion";

const questions = [
  { id: 1, question: "🛡️ What is the main company policy?", correct: "Respect", options: ["Respect", "Ignore", "Forget"] },
  { id: 2, question: "🔥 What should you do in case of a fire?", correct: "Evacuate", options: ["Stay", "Evacuate", "Run"] },
];

export default function Quiz({ setProgress }) {
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [selected, setSelected] = useState({});

  const handleAnswerClick = (qId, option) => {
    setAnswers({ ...answers, [qId]: option });
    setSelected({ ...selected, [qId]: option });
  };

  const handleSubmit = () => {
    const correctAnswers = questions.filter((q) => answers[q.id] === q.correct).length;
    setCompleted(true);
    setProgress((correctAnswers / questions.length) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <h2 className="text-3xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        🧠 Induction Quiz
      </h2>
      {questions.map((q) => (
        <motion.div
          key={q.id}
          className="mb-4 p-6 bg-gray-900 border border-gray-700 rounded-lg shadow-lg transition-all"
        >
          <p className="mb-3 text-lg">{q.question}</p>
          {q.options.map((option) => (
            <motion.div
              key={option}
              className={`cursor-pointer p-4 rounded-lg transition-all text-lg ${
                selected[q.id] === option ? "bg-blue-500 text-white scale-105" : "bg-gray-800 text-gray-200"
              }`}
              onClick={() => handleAnswerClick(q.id, option)}
            >
              {option}
            </motion.div>
          ))}
        </motion.div>
      ))}
      {!completed && (
        <motion.button
          onClick={handleSubmit}
          className="mt-5 px-8 py-4 text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-all"
        >
          ✅ Submit Quiz
        </motion.button>
      )}
    </motion.div>
  );
}
