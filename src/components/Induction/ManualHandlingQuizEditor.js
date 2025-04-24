import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaSave, FaTrash } from "react-icons/fa";

export default function ManualHandlingQuizEditor() {
  const [questions, setQuestions] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [edits, setEdits] = useState({});

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:5001/quiz/manual-handling");
      setQuestions(res.data);
    } catch (err) {
      console.error("❌ Failed to load questions", err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleEditToggle = (id, question) => {
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
    setEdits((prev) => ({
      ...prev,
      [id]: {
        question: question.question,
        option_a: question.option_a || "",
        option_b: question.option_b || "",
        option_c: question.option_c || "",
        option_d: question.option_d || "",
        option_e: question.option_e || "",
        correct_answer: question.correct_answer || "",
        multi_select: question.multi_select === 1,
      },
    }));
  };

  const handleEditChange = (id, field, value) => {
    setEdits((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/quiz/manual-handling/questions/${id}`,
        edits[id],
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditMode((prev) => ({ ...prev, [id]: false }));
      setEdits((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      fetchQuestions();
    } catch (err) {
      console.error("❌ Failed to save changes:", err);
      alert("❌ Save failed");
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await axios.delete(`http://localhost:5001/quiz/manual-handling/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchQuestions();
    } catch (err) {
      console.error("❌ Failed to delete question:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-400">
      <h2 className="text-xl font-bold text-[#003c64] mb-4">🛠 Manual Handling Quiz Editor</h2>
      {questions.map((q) => (
        <div key={q.id} className="border rounded p-4 mb-4 shadow-sm">
          {editMode[q.id] ? (
            <>
              <input
                type="text"
                value={edits[q.id].question}
                onChange={(e) => handleEditChange(q.id, "question", e.target.value)}
                className="w-full mb-2 p-2 border rounded"
              />
              {["a", "b", "c", "d", "e"].map((opt) => (
                <input
                  key={opt}
                  type="text"
                  value={edits[q.id][`option_${opt}`] || ""}
                  onChange={(e) => handleEditChange(q.id, `option_${opt}`, e.target.value)}
                  placeholder={`Option ${opt.toUpperCase()}`}
                  className="w-full mb-1 p-2 border rounded"
                />
              ))}
              <input
                type="text"
                value={edits[q.id].correct_answer}
                onChange={(e) => handleEditChange(q.id, "correct_answer", e.target.value)}
                placeholder="Correct Answer (e.g., A or A,C)"
                className="w-full mb-2 p-2 border rounded"
              />
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={edits[q.id].multi_select}
                  onChange={(e) => handleEditChange(q.id, "multi_select", e.target.checked)}
                />
                Multi-select
              </label>
              <button
                onClick={() => handleSave(q.id)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded flex items-center gap-2"
              >
                <FaSave /> Save
              </button>
            </>
          ) : (
            <>
              <p className="font-semibold mb-1">{q.question}</p>
              <ul className="text-sm text-gray-700 mb-2">
                {["a", "b", "c", "d", "e"].map((opt) =>
                  q[`option_${opt}`] ? (
                    <li key={opt}>
                      <strong>{opt.toUpperCase()}.</strong> {q[`option_${opt}`]}
                    </li>
                  ) : null
                )}
              </ul>
              <p className="text-xs text-gray-500 mb-1">✅ Correct Answer: {q.correct_answer}</p>
              <p className="text-xs text-gray-500 mb-2">
                🟡 Multi-select: {q.multi_select ? "Yes" : "No"}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEditToggle(q.id, q)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-2"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-2"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
