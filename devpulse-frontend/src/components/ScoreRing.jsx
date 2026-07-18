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

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  let color = "#f43f5e"; // Rose-500 redish-pink
  let glowColor = "rgba(244, 63, 94, 0.4)";

  if (score >= 80) {
    color = "#10b981"; // Emerald-500
    glowColor = "rgba(16, 185, 129, 0.4)";
  } else if (score >= 50) {
    color = "#f59e0b"; // Amber-500
    glowColor = "rgba(245, 158, 11, 0.4)";
  }

  const isDark = theme === "dark";

  return (
    <div className="flex justify-center items-center select-none">
      <svg width="220" height="220" viewBox="0 0 220 220" className="drop-shadow-lg">
        {/* Glow Filters */}
        <defs>
          <filter id="ring-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={color} floodOpacity="0.5" />
          </filter>
          <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </linearGradient>
        </defs>

        {/* Background Track Circle */}
        <circle
          cx="110"
          cy="110"
          r={radius}
          stroke={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(219, 39, 119, 0.08)"}
          strokeWidth="10"
          fill="none"
        />

        {/* Active Animated Progress Circle */}
        <circle
          cx="110"
          cy="110"
          r={radius}
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 110 110)"
          filter="url(#ring-glow)"
          style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
        />

        {/* Score Number Text */}
        <text
          x="110"
          y="114"
          textAnchor="middle"
          fill={isDark ? "#ffffff" : "#1e293b"}
          fontSize="38"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {animatedScore}
        </text>

        {/* Small "points" indicator below score */}
        <text
          x="110"
          y="134"
          textAnchor="middle"
          fill={isDark ? "#94a3b8" : "#64748b"}
          fontSize="10"
          fontWeight="bold"
          letterSpacing="1.5"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          PULSE SCORE
        </text>
      </svg>
    </div>
  );
}

export default ScoreRing;
