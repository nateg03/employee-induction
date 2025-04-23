import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaPlus } from "react-icons/fa";

export default function QuizEditor() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");

  // Fetch all questions from the backend
  const fetchQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:5001/quiz/typed-questions");
      setQuestions(res.data);
    } catch (err) {
      console.error("❌ Failed to load questions:", err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Add new question
  const addQuestion = async () => {
    if (!newQuestion.trim()) return;
    try {
      await axios.post("http://localhost:5001/quiz/typed-questions", {
        question: newQuestion.trim(),
      });
      setNewQuestion("");
      fetchQuestions();
    } catch (err) {
      console.error("❌ Failed to add question:", err);
    }
  };

  // Update existing question
  const updateQuestion = async (id, updatedText) => {
    try {
      await axios.put(`http://localhost:5001/quiz/typed-questions/${id}`, {
        question: updatedText,
      });
    } catch (err) {
      console.error("❌ Failed to update question:", err);
    }
  };

  // Delete a question
  const deleteQuestion = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/quiz/typed-questions/${id}`);
      fetchQuestions();
    } catch (err) {
      console.error("❌ Failed to delete question:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-400">
      <h2 className="text-xl font-bold text-[#003c64] mb-4">✏️ Edit Quiz Questions</h2>

      {/* Existing Questions List */}
      <ul className="space-y-4">
        {questions.map((q) => (
          <li key={q.id} className="flex items-start gap-3">
            <textarea
              defaultValue={q.question}
              onBlur={(e) => updateQuestion(q.id, e.target.value)}
              className="w-full border p-2 rounded resize-y"
            />
            <button
              onClick={() => deleteQuestion(q.id)}
              className="text-red-500 hover:text-red-700 mt-1"
              title="Delete"
            >
              <FaTrash />
            </button>
          </li>
        ))}
      </ul>

      {/* New Question Form */}
      <div className="mt-6 flex gap-2 items-center">
        <input
          type="text"
          placeholder="New question"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          className="flex-1 border px-4 py-2 rounded"
        />
        <button
          onClick={addQuestion}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          <FaPlus /> Add
        </button>
      </div>
    </div>
  );
}
