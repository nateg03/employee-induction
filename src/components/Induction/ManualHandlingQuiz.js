import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../auth/AuthContext";

export default function ManualHandlingQuiz() {
  const { auth } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await axios.get("http://localhost:5001/quiz/manual-handling-questions");
        setQuestions(res.data);
      } catch (err) {
        console.error("Failed to load questions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const handleChange = (questionId, value, isMultiSelect) => {
    if (isMultiSelect) {
      setAnswers((prev) => {
        const prevAnswers = prev[questionId] || [];
        const updated = prevAnswers.includes(value)
          ? prevAnswers.filter((v) => v !== value)
          : [...prevAnswers, value];
        return { ...prev, [questionId]: updated };
      });
    } else {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    }
  };

  const handleSubmit = async () => {
    if (submitted) return;

    try {
      await axios.post(
        "http://localhost:5001/quiz/manual-handling/submit",
        { userId: auth.user.id, answers },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit answers:", err);
    }
  };

  if (loading) {
    return <div className="quiz-container">Loading questions...</div>;
  }

  if (submitted) {
    return <div className="quiz-container">✅ Quiz submitted successfully!</div>;
  }

  return (
    <div className="quiz-container">
      <h2 className="text-xl font-bold text-[#003c64] mb-4">Manual Handling Quiz</h2>

      <div className="quiz-questions-scroll">
        {questions.map((q) => (
          <div key={q.id} className="manual-handling-question">
            <h3>{q.question}</h3>
            <div className="answers">
              {q.option_a && (
                <label className="answer-option">
                  <input
                    type={q.multi_select ? "checkbox" : "radio"}
                    name={`question-${q.id}`}
                    value="A"
                    checked={q.multi_select ? answers[q.id]?.includes("A") : answers[q.id] === "A"}
                    onChange={() => handleChange(q.id, "A", q.multi_select)}
                  />
                  {q.option_a}
                </label>
              )}
              {q.option_b && (
                <label className="answer-option">
                  <input
                    type={q.multi_select ? "checkbox" : "radio"}
                    name={`question-${q.id}`}
                    value="B"
                    checked={q.multi_select ? answers[q.id]?.includes("B") : answers[q.id] === "B"}
                    onChange={() => handleChange(q.id, "B", q.multi_select)}
                  />
                  {q.option_b}
                </label>
              )}
              {q.option_c && (
                <label className="answer-option">
                  <input
                    type={q.multi_select ? "checkbox" : "radio"}
                    name={`question-${q.id}`}
                    value="C"
                    checked={q.multi_select ? answers[q.id]?.includes("C") : answers[q.id] === "C"}
                    onChange={() => handleChange(q.id, "C", q.multi_select)}
                  />
                  {q.option_c}
                </label>
              )}
              {q.option_d && (
                <label className="answer-option">
                  <input
                    type={q.multi_select ? "checkbox" : "radio"}
                    name={`question-${q.id}`}
                    value="D"
                    checked={q.multi_select ? answers[q.id]?.includes("D") : answers[q.id] === "D"}
                    onChange={() => handleChange(q.id, "D", q.multi_select)}
                  />
                  {q.option_d}
                </label>
              )}
              {q.option_e && (
                <label className="answer-option">
                  <input
                    type={q.multi_select ? "checkbox" : "radio"}
                    name={`question-${q.id}`}
                    value="E"
                    checked={q.multi_select ? answers[q.id]?.includes("E") : answers[q.id] === "E"}
                    onChange={() => handleChange(q.id, "E", q.multi_select)}
                  />
                  {q.option_e}
                </label>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="submit-button mt-4" onClick={handleSubmit}>
        Submit Answers
      </button>
    </div>
  );
}
