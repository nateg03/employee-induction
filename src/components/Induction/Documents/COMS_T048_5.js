import React, { useState } from "react";

export default function InductionQuestionnaire() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = [
    {
      id: 1,
      type: "multiple-choice",
      question: "🚪 What is the correct procedure for entering the Pavilion?",
      options: ["Swipe your badge and enter", "Knock and wait for approval", "Walk in freely"],
    },
    {
      id: 2,
      type: "open-ended",
      question: "🛑 Describe the emergency evacuation procedure.",
      placeholder: "Write your answer here...",
    },
    {
      id: 3,
      type: "multiple-choice",
      question: "🦺 What PPE is required inside the Pavilion?",
      options: ["Helmet & gloves", "High-visibility vest", "Safety boots", "All of the above"],
    },
  ];

  const handleAnswerChange = (id, value) => {
    setAnswers({ ...answers, [id]: value });
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        📝 Derwentwater Pavilion Induction Questionnaire
      </h2>

      {questions.map((q) => (
        <div key={q.id} className="mb-4">
          <p className="text-gray-900 dark:text-gray-200">{q.question}</p>

          {q.type === "multiple-choice" ? (
            <div className="flex flex-col mt-2">
              {q.options.map((option) => (
                <label key={option} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={option}
                    checked={answers[q.id] === option}
                    onChange={() => handleAnswerChange(q.id, option)}
                  />
                  <span className="text-gray-900 dark:text-gray-200">{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              className="w-full p-3 mt-2 border rounded-md dark:bg-gray-800 dark:text-white"
              placeholder={q.placeholder}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            ></textarea>
          )}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="mt-5 px-6 py-3 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-all"
        >
          ✅ Submit Questionnaire
        </button>
      ) : (
        <p className="text-green-500 mt-4">✔️ Thank you! Your responses have been submitted.</p>
      )}
    </div>
  );
}
