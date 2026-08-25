import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function getScoreColor(score) {
  if (score >= 75) return "text-green-500";
  if (score >= 50) return "text-amber-500";
  return "text-rose-500";
}

function getScoreBarColor(score) {
  if (score >= 75) return "bg-green-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-rose-500";
}

function RepositoryHealth({ username, theme }) {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    axios
      .get(`${API_URL}/repo-health/${username}`)
      .then((res) => setHealthData(res.data.repos || []))
      .catch(() => setHealthData([]))
      .finally(() => setLoading(false));
  }, [username]);

  const isDark = theme === "dark";
  const mutedText = isDark ? "text-slate-400" : "text-slate-500";
  const cardClass = `p-5 rounded-xl border transition-colors duration-300 ${
    isDark ? "bg-[#12131A] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"
  }`;

  if (loading) {
    return (
      <div className={cardClass}>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className={`text-xs ${mutedText}`}>Checking repository health...</span>
        </div>
      </div>
    );
  }

  if (!healthData || healthData.length === 0) return null;

  const sorted = [...healthData].sort((a, b) => a.score - b.score); // worst first — most actionable
  const visibleRepos = expanded ? sorted : sorted.slice(0, 3);
  const avgScore = Math.round(healthData.reduce((sum, r) => sum + r.score, 0) / healthData.length);

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-400">Repository Health</h3>
        <span className={`text-xs font-semibold ${getScoreColor(avgScore)}`}>{avgScore}/100 avg</span>
      </div>
      <p className={`text-xs mb-4 ${mutedText}`}>
        Based on README, license, and recent activity — not star count.
      </p>

      <div className="space-y-3">
        {visibleRepos.map((repo) => (
          <div key={repo.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold">{repo.name}</span>
              <span className={`text-xs font-semibold ${getScoreColor(repo.score)}`}>{repo.score}/100</span>
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden mb-1.5 ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
              <div
                className={`h-full rounded-full ${getScoreBarColor(repo.score)}`}
                style={{ width: `${repo.score}%`, transition: "width 0.3s ease" }}
              ></div>
            </div>
            {repo.score < 100 && (
              <p className={`text-[11px] ${mutedText}`}>
                Missing:{" "}
                {[
                  !repo.hasReadme && "README",
                  !repo.hasLicense && "license",
                  !repo.isRecent && "recent activity",
                  !repo.hasDescription && "description",
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>

      {healthData.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-medium text-indigo-500 hover:text-indigo-600 mt-3"
        >
          {expanded ? "Show less" : `Show all ${healthData.length} repositories`}
        </button>
      )}
    </div>
  );
}

export default RepositoryHealth;