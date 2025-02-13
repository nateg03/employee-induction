import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function ProgressTracker({ progress }) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (progress === 100) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [progress]);

  return (
    <div className="relative mb-6 text-center">
      {showConfetti && <Confetti width={width} height={height} />}
      <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-200">📊 Completion Progress: {Math.round(progress)}%</h2>
      <div className="relative w-full bg-gray-300 dark:bg-gray-700 rounded-full h-6 overflow-hidden shadow-lg">
        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      {progress === 100 && <h3 className="text-2xl font-semibold text-green-500 mt-4 animate-bounce">🎉 Congratulations! Induction Completed! 🎉</h3>}
    </div>
  );
}
