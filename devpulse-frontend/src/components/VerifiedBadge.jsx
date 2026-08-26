import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function VerifiedBadge({ username, theme, size = "sm" }) {
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!username) return;
    axios
      .get(`${API_URL}/verified/${username}`)
      .then((res) => setVerified(res.data.verified))
      .catch(() => setVerified(false));
  }, [username]);

  if (!verified) return null;

  const isDark = theme === "dark";
  const dims = size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5";

  return (
    <span
      title="Verified — this person proved ownership of this GitHub account via OAuth"
      className={`inline-flex items-center justify-center rounded-full ${
        isDark ? "bg-indigo-500" : "bg-indigo-500"
      }`}
      style={{ width: size === "lg" ? "18px" : "16px", height: size === "lg" ? "18px" : "16px" }}
    >
      <svg className={`${dims} text-white`} fill="currentColor" viewBox="0 0 20 20" style={{ width: "70%", height: "70%" }}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

export default VerifiedBadge;