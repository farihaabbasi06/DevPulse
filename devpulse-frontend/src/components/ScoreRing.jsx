
import { useState, useEffect } from "react";

function ScoreRing({ score, theme }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setAnimatedScore(current);
      if (current >= score) {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [score]);

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  let color = "#f43f5e"; // Rose-500
  if (score >= 80) {
    color = "#10b981"; // Emerald-500
  } else if (score >= 50) {
    color = "#f59e0b"; // Amber-500
  }

  const isDark = theme === "dark";

  return (
    <div className="flex justify-center items-center select-none">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke={isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(219, 39, 119, 0.08)"}
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 80 80)"
          style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
        />
        <text
          x="80"
          y="84"
          textAnchor="middle"
          fill={isDark ? "#f1f5f9" : "#1e293b"}
          fontSize="28"
          fontWeight="600"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {animatedScore}
        </text>
        <text
          x="80"
          y="100"
          textAnchor="middle"
          fill={isDark ? "#94a3b8" : "#64748b"}
          fontSize="8"
          fontWeight="600"
          letterSpacing="1"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          PULSE SCORE
        </text>
      </svg>
    </div>
  );
}

export default ScoreRing;