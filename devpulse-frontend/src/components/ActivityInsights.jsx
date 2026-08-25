import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Phrases that signal a lazy/low-effort commit message
const LAZY_PHRASES = [
  "fix", "fixed", "fix bug", "update", "updated", "updates", "wip",
  "test", "testing", "asdf", "changes", "stuff", "misc", "minor",
  "small fix", "typo", "final", "done", "temp", "checkpoint",
];

function isLazyMessage(message) {
  const clean = message.trim().toLowerCase();
  if (clean.length < 10) return true;
  return LAZY_PHRASES.some((phrase) => clean === phrase || clean === `${phrase}.`);
}

function calculateStreak(commits) {
  if (!commits || commits.length === 0) return 0;
  const daySet = new Set(commits.map((c) => new Date(c.date).toDateString()));
  let streak = 0;
  let cursor = new Date();
  // Allow the streak to still count if today has no commit yet but yesterday does
  if (!daySet.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (daySet.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function calculateTimePattern(commits) {
  if (!commits || commits.length === 0) return null;
  const buckets = { "Early Bird (5am–11am)": 0, "Daytime (11am–5pm)": 0, "Evening (5pm–10pm)": 0, "Night Owl (10pm–5am)": 0 };
  commits.forEach((c) => {
    const hour = new Date(c.date).getHours();
    if (hour >= 5 && hour < 11) buckets["Early Bird (5am–11am)"]++;
    else if (hour >= 11 && hour < 17) buckets["Daytime (11am–5pm)"]++;
    else if (hour >= 17 && hour < 22) buckets["Evening (5pm–10pm)"]++;
    else buckets["Night Owl (10pm–5am)"]++;
  });
  const topBucket = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0];
  return { buckets, topLabel: topBucket[0], topCount: topBucket[1], total: commits.length };
}

function calculateMessageQuality(commits) {
  if (!commits || commits.length === 0) return null;
  const lazy = commits.filter((c) => isLazyMessage(c.message));
  const score = Math.round(((commits.length - lazy.length) / commits.length) * 100);
  return {
    score,
    lazyCount: lazy.length,
    total: commits.length,
    examples: lazy.slice(0, 3).map((c) => c.message),
  };
}

function ActivityInsights({ username, theme }) {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    axios
      .get(`${API_URL}/activity/${username}`)
      .then((res) => setActivity(res.data.commits || []))
      .catch(() => setActivity([]))
      .finally(() => setLoading(false));
  }, [username]);

  const isDark = theme === "dark";
  const cardClass = `p-5 rounded-xl border transition-colors duration-300 ${
    isDark ? "bg-[#12131A] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"
  }`;
  const mutedText = isDark ? "text-slate-400" : "text-slate-500";

  if (loading) {
    return (
      <div className={cardClass}>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className={`text-xs ${mutedText}`}>Analyzing commit activity...</span>
        </div>
      </div>
    );
  }

  if (!activity || activity.length === 0) {
    return null;
  }

  const streak = calculateStreak(activity);
  const timePattern = calculateTimePattern(activity);
  const messageQuality = calculateMessageQuality(activity);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Streak */}
      <div className={cardClass}>
        <h3 className={`text-[10px] font-semibold uppercase tracking-wide mb-2 ${mutedText}`}>
          Current Streak
        </h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl">🔥</span>
          <span className="text-3xl font-semibold">{streak}</span>
          <span className={`text-xs ${mutedText}`}>day{streak !== 1 ? "s" : ""}</span>
        </div>
        <p className={`text-xs mt-2 ${mutedText}`}>
          {streak > 0 ? "Keep it going — commit today to extend it." : "No active streak. Commit today to start one."}
        </p>
      </div>

      {/* Coding time pattern */}
      {timePattern && (
        <div className={cardClass}>
          <h3 className={`text-[10px] font-semibold uppercase tracking-wide mb-2 ${mutedText}`}>
            Coding Pattern
          </h3>
          <p className="text-lg font-semibold leading-tight">{timePattern.topLabel.split(" (")[0]}</p>
          <p className={`text-xs mt-1 ${mutedText}`}>
            {timePattern.topCount} of {timePattern.total} recent commits happen during {timePattern.topLabel.split("(")[1]?.replace(")", "")}
          </p>
        </div>
      )}

      {/* Commit message quality */}
      {messageQuality && (
        <div className={cardClass}>
          <h3 className={`text-[10px] font-semibold uppercase tracking-wide mb-2 ${mutedText}`}>
            Commit Message Quality
          </h3>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-semibold ${
              messageQuality.score >= 80 ? "text-green-500" : messageQuality.score >= 50 ? "text-amber-500" : "text-rose-500"
            }`}>
              {messageQuality.score}%
            </span>
            <span className={`text-xs ${mutedText}`}>descriptive</span>
          </div>
          {messageQuality.lazyCount > 0 ? (
            <p className={`text-xs mt-2 ${mutedText}`}>
              {messageQuality.lazyCount} of {messageQuality.total} recent messages are vague (e.g. "{messageQuality.examples[0]}"). Try describing <em>what</em> changed and <em>why</em>.
            </p>
          ) : (
            <p className={`text-xs mt-2 ${mutedText}`}>Your recent commit messages are clear and descriptive.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ActivityInsights;