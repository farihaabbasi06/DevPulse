// Badge rules — each takes (stats, languages, repos, user) and returns
// true/false. Pure functions, easy to add more rules later.
const BADGE_DEFINITIONS = [
  {
    id: "polyglot",
    label: "Polyglot",
    description: "Uses 5+ languages",
    icon: "🌐",
    check: (stats, languages) => Object.keys(languages || {}).length >= 5,
  },
  {
    id: "open-source-hero",
    label: "Open Source Hero",
    description: "20+ stars across repos",
    icon: "⭐",
    check: (stats) => (stats?.stars || 0) >= 20,
  },
  {
    id: "prolific-committer",
    label: "Prolific Committer",
    description: "500+ commits",
    icon: "🔥",
    check: (stats) => (stats?.commits || 0) >= 500,
  },
  {
    id: "builder",
    label: "Builder",
    description: "10+ public repositories",
    icon: "🏗️",
    check: (stats) => (stats?.repos || 0) >= 10,
  },
  {
    id: "pr-contributor",
    label: "Collaborator",
    description: "10+ pull requests",
    icon: "🤝",
    check: (stats) => (stats?.prs || 0) >= 10,
  },
  {
    id: "rising-star",
    label: "Rising Star",
    description: "100+ GitHub followers",
    icon: "📈",
    check: (stats, languages, repos, user) => (user?.followers || 0) >= 100,
  },
  {
    id: "veteran",
    label: "Veteran",
    description: "GitHub member for 5+ years",
    icon: "🎖️",
    check: (stats, languages, repos, user) => {
      if (!user?.joined) return false;
      const years = (Date.now() - new Date(user.joined).getTime()) / (1000 * 60 * 60 * 24 * 365);
      return years >= 5;
    },
  },
  {
    id: "first-steps",
    label: "First Steps",
    description: "Made your first commit",
    icon: "🌱",
    check: (stats) => (stats?.commits || 0) >= 1,
  },
];

export function getEarnedBadges(stats, languages, repos, user) {
  return BADGE_DEFINITIONS.filter((badge) => badge.check(stats, languages, repos, user));
}

// ── Badge display component ──────────────────────────────────────
function AchievementBadges({ stats, languages, repos, user, theme }) {
  const isDark = theme === "dark";
  const earned = getEarnedBadges(stats, languages, repos, user);

  if (earned.length === 0) return null;

  return (
    <div className={`p-5 rounded-xl border transition-colors duration-300 ${
      isDark ? "bg-[#12131A] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"
    }`}>
      <h3 className="text-sm font-semibold mb-3 text-slate-400">
        Achievements
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {earned.map((badge) => (
          <div
            key={badge.id}
            className={`p-3 rounded-lg text-center border ${
              isDark ? "bg-indigo-500/[0.06] border-indigo-500/15" : "bg-indigo-50 border-indigo-100"
            }`}
            title={badge.description}
          >
            <p className="text-lg mb-1">{badge.icon}</p>
            <p className={`text-[10px] font-semibold ${isDark ? "text-indigo-300" : "text-indigo-600"}`}>
              {badge.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AchievementBadges;