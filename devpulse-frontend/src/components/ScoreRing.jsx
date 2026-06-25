import { useState, useEffect } from "react";

function ScoreRing({ score }) {
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

  const offset =
    circumference -
    (animatedScore / 100) * circumference;

    let color = "#ef4444";

if (score >= 80) {
  color = "#22c55e";
} else if (score >= 50) {
  color = "#eab308";
}

  return (
    <svg width="200" height="200">

      <circle
        cx="100"
        cy="100"
        r={radius}
        stroke="#333"
        strokeWidth="12"
        fill="none"
      />

      <circle
        cx="100"
        cy="100"
        r={radius}
        stroke={color}
        strokeWidth="12"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 100 100)"
      />

      <text
  x="100"
  y="110"
  textAnchor="middle"
  fill="white"
  fontSize="32"
  fontWeight="bold"
>
  {animatedScore}
</text>

    </svg>
  );
}

export default ScoreRing;