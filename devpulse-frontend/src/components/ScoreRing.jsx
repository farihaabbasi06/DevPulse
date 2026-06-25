function ScoreRing({ score }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference -
    (score / 100) * circumference;

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
        stroke="#ec4899"
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
  {score}
</text>

    </svg>
  );
}

export default ScoreRing;