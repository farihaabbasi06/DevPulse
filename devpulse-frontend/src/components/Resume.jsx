function Resume({ user, stats, languages, repos }) {
   const skills = Object.keys(languages || {}).slice(0, 8);
   const topProjects = (repos || []).slice(0, 3);
  return (
  <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
    <div className="bg-white w-full max-w-4xl shadow-xl rounded-lg p-10">

      <div className="border-b pb-6">

        <h1 className="text-4xl font-bold text-gray-900">
          {user?.name}
        </h1>

        <p className="text-lg text-gray-600 mt-1">
          @{user?.username}
        </p>

        <div className="mt-4 space-y-2 text-gray-700">

          <p>
            📧 {user?.email || "Email not public"}
          </p>

          <p>
            📍 {user?.location || "Location not specified"}
          </p>

          <p>
            🌐 https://github.com/{user?.username}
          </p>
          <div className="mt-8">
  <h2 className="text-2xl font-bold text-gray-800 mb-3">
    Skills
  </h2>

  <div className="flex flex-wrap gap-2">
    {skills.map((skill) => (
      <span
        key={skill}
        className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
      >
        {skill}
      </span>
    ))}
  </div>
</div>
          
          <div className="mt-10">
  <h2 className="text-2xl font-bold text-gray-800 mb-4">
    Projects
  </h2>

  {topProjects.map((repo) => (
    <div
      key={repo.name}
      className="border rounded-lg p-4 mb-4"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">
          {repo.name}
        </h3>

        <span className="text-yellow-600 font-semibold">
          ⭐ {repo.stars}
        </span>
      </div>

      <p className="text-gray-600 mt-2">
        {repo.description || "No description available"}
      </p>

      <a
        href={repo.url}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 underline mt-2 inline-block"
      >
        View on GitHub
      </a>
    </div>
  ))}
</div>
            
        </div>
 <div className="mt-6">
  <span className="bg-pink-500 text-white px-5 py-2 rounded-full font-bold text-lg">
    DevPulse Score: {user?.score}/100
  </span>
</div>
      </div>


     
      
    </div>
  </div>
);
}

export default Resume;