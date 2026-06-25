function DevCard({ user, stats, languages, theme }) {

    const themes = {
  pink: {
    card: "bg-gray-900 border-pink-500",
    accent: "text-pink-500",
    pill: "bg-pink-500",
    stat: "text-pink-400"
  },

  navy: {
    card: "bg-slate-900 border-blue-500",
    accent: "text-blue-500",
    pill: "bg-blue-500",
    stat: "text-blue-400"
  },

  purple: {
    card: "bg-gray-900 border-purple-500",
    accent: "text-purple-500",
    pill: "bg-purple-500",
    stat: "text-purple-400"
  }
};

const currentTheme = themes[theme];

  return (
    <div
    className={`p-6 rounded-xl w-full max-w-md border ${currentTheme.card}`}
  >

      <img
        src={user?.avatar}
        alt="avatar"
       className={`text-center text-2xl font-bold mt-4 ${currentTheme.accent}`}
      />

      <h2 className="text-center text-2xl font-bold mt-4 text-pink-500">
        {user?.name}
      </h2>

      <p className="text-center text-gray-400">
        @{user?.username}
      </p>

      <p className="text-center mt-2">
        📍 {user?.location}
      </p>

      <div className="text-center mt-4">
        <span className={`text-4xl font-bold ${currentTheme.accent}`}>
          {user?.score}
        </span>

        <p className="text-gray-400">
          Reputation Score
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">

  <div className="bg-black p-3 rounded-lg text-center">
    <p className={currentTheme.stat}>🔥 Commits</p>
    <p className="font-bold">{stats?.commits}</p>
  </div>

  <div className="bg-black p-3 rounded-lg text-center">
    <p className={currentTheme.stat}>📦 Repos</p>
    <p className="font-bold">{stats?.repos}</p>
  </div>

  <div className="bg-black p-3 rounded-lg text-center">
    <p className={currentTheme.stat}>🔁 PRs</p>
    <p className="font-bold">{stats?.prs}</p>
  </div>

  <div className="bg-black p-3 rounded-lg text-center">
    <p className={currentTheme.stat}>⭐ Stars</p>
    <p className="font-bold">{stats?.stars}</p>
  </div>
    
    <h3 className="mt-6 mb-3 text-center font-bold {currentTheme.stat}">
  Top Languages
</h3>
<div className="flex flex-wrap justify-center gap-2">

  {Object.keys(languages || {})
    .slice(0, 5)
    .map((lang) => (
      <span
        key={lang}
       className={`px-3 py-1 text-white rounded-full text-sm ${currentTheme.pill}`}
      >
        {lang}
      </span>
    ))}

</div>
<div className="mt-6 pt-4 border-t border-gray-700 text-center">
  <p className="text-sm text-gray-400">
    devpulse.xyz/{user?.username}
  </p>
</div>
</div>

    </div>
  );
}

export default DevCard;