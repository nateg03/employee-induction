import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function ProgressTracker({ progress }) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (progress === 100) {
      setShowConfetti(true);
      setShowMessage(true);

      const timer = setTimeout(() => setShowMessage(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
      setShowMessage(false);
    }
  }, [progress]);

  return (
    <div className="relative w-full max-w-2xl mx-auto text-center">
      {/* Confetti and Completion Message */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti width={width} height={height} />
          {showMessage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-4xl font-extrabold text-white bg-blue-700 bg-opacity-90 px-10 py-6 rounded-2xl shadow-2xl animate-fadeout">
                🎉 Induction Complete! 🎉
              </h1>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative mt-6 h-10 w-full bg-gray-300 rounded-full shadow-inner overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shine opacity-20" />
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-full transition-all duration-700 ease-in-out shadow-lg"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-lg font-bold drop-shadow-sm">
            {progress.toFixed(0)}% Complete
          </span>
        </div>
      </div>
    </div>
  );
}
