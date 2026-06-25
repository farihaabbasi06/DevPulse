function DevCard({ user, stats, languages }) {
  return (
    <div className="bg-gray-900 border border-pink-500 p-6 rounded-xl w-full max-w-md">

      <img
        src={user?.avatar}
        alt="avatar"
        className="w-24 h-24 rounded-full mx-auto border-2 border-pink-500"
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
        <span className="text-4xl font-bold text-pink-500">
          {user?.score}
        </span>

        <p className="text-gray-400">
          Reputation Score
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">

  <div className="bg-black p-3 rounded-lg text-center">
    <p className="text-pink-400">🔥 Commits</p>
    <p className="font-bold">{stats?.commits}</p>
  </div>

  <div className="bg-black p-3 rounded-lg text-center">
    <p className="text-pink-400">📦 Repos</p>
    <p className="font-bold">{stats?.repos}</p>
  </div>

  <div className="bg-black p-3 rounded-lg text-center">
    <p className="text-pink-400">🔁 PRs</p>
    <p className="font-bold">{stats?.prs}</p>
  </div>

  <div className="bg-black p-3 rounded-lg text-center">
    <p className="text-pink-400">⭐ Stars</p>
    <p className="font-bold">{stats?.stars}</p>
  </div>
    
    <h3 className="mt-6 mb-3 text-center font-bold text-pink-400">
  Top Languages
</h3>
<div className="flex flex-wrap justify-center gap-2">

  {Object.keys(languages || {})
    .slice(0, 5)
    .map((lang) => (
      <span
        key={lang}
        className="px-3 py-1 bg-pink-500 text-white rounded-full text-sm"
      >
        {lang}
      </span>
    ))}

</div>
</div>

    </div>
  );
}

export default DevCard;