import { useState, useEffect } from "react";
import axios from "axios";
import LanguageChart from "./components/LanguageChart";
import ContributionChart from "./components/ContributionChart";

function App() {
 const [username, setUsername] = useState("");
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [contributions, setContributions] = useState({});

const [stats, setStats] = useState({
  commits: 0,
  repos: 0,
  prs: 0,
  stars: 0
});

const [languages, setLanguages] = useState({});
const [repos, setRepos] = useState([]);

const [displayStats, setDisplayStats] = useState({
  commits: 0,
  repos: 0,
  prs: 0,
  stars: 0
});



 const searchUser = async () => {
  try {
    setLoading(true);
    setError("");
    setUser(null);

    const response = await axios.get(
      `http://localhost:5000/api/user/${username}`
    );

    setUser(response.data);

    const reposResponse = await axios.get(
      `http://localhost:5000/api/repos/${username}`
    );

    setRepos(reposResponse.data.repos);
    

const languageCount = {};

reposResponse.data.repos.forEach((repo) => {
  repo.languages.forEach((lang) => {
    languageCount[lang] =
      (languageCount[lang] || 0) + 1;
  });
});

setLanguages(languageCount);

    const prResponse = await axios.get(
  `http://localhost:5000/api/pullrequests/${username}`
);

const commitsResponse = await axios.get(
  `http://localhost:5000/api/commits/${username}`
);

const contributionResponse = await axios.get(
  `http://localhost:5000/api/contributions/${username}`
);

setContributions(contributionResponse.data);


   setStats(prev => ({
  ...prev,
  repos: reposResponse.data.totalRepos,
  stars: reposResponse.data.totalStars,
  prs: prResponse.data.totalPullRequests,
  commits: commitsResponse.data.totalCommits
}));

  } catch (err) {
    setError("User not found");

  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const interval = setInterval(() => {

    setDisplayStats(prev => ({
      commits: prev.commits < stats.commits
        ? prev.commits + 1
        : prev.commits,

      repos: prev.repos < stats.repos
        ? prev.repos + 1
        : prev.repos,

      prs: prev.prs < stats.prs
        ? prev.prs + 1
        : prev.prs,

      stars: prev.stars < stats.stars
        ? prev.stars + 1
        : prev.stars
    }));

  }, 50);

  return () => clearInterval(interval);

}, [stats]);




  return (
    <div className="min-h-screen bg-gray-100">

      <nav className="bg-black text-white p-4">
        <h1 className="text-2xl font-bold">DevPulse</h1>
      </nav>

      <div className="flex flex-col items-center mt-20">

        <h1 className="text-5xl font-bold mb-6">
          GitHub Developer Analytics
        </h1>

        <input
          type="text"
          placeholder="Enter GitHub Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-3 w-80 rounded-lg"
        />

        <button
          onClick={searchUser}
          className="bg-blue-500 text-white px-6 py-3 mt-4 rounded-lg"
        >
          Search
        </button>

{loading && (
  <p className="mt-4 text-blue-600">
    Loading...
  </p>
)}

{error && (
  <p className="mt-4 text-red-600">
    {error}
  </p>
)}
        {user && (
          <div className="bg-white p-6 mt-8 rounded-lg shadow-lg">
           
           
            <img
              src={user.avatar}
              alt="avatar"
              className="w-32 rounded-full mx-auto"
            />

            <h2 className="text-2xl font-bold mt-4">
              {user.name}
            </h2>
            <p>@{user.username}</p>
            <p>{user.bio}</p>

            <p>Followers: {user.followers}</p>
     
            <p>
  Joined: {new Date(user.joined).toLocaleDateString()}
</p>

            <p>Location: {user.location}</p>

          </div>
          
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">

  <div className="bg-white p-4 rounded-lg shadow text-center">
    <h3 className="text-gray-500">Commits</h3>
    <p className="text-2xl font-bold">{displayStats.commits}</p>
  </div>

  <div className="bg-white p-4 rounded-lg shadow text-center">
    <h3 className="text-gray-500">Repos</h3>
    <p className="text-2xl font-bold">{displayStats.repos}</p>
  </div>

  <div className="bg-white p-4 rounded-lg shadow text-center">
    <h3 className="text-gray-500">PRs</h3>
    <p className="text-2xl font-bold">{displayStats.prs}</p>
  </div>

  <div className="bg-white p-4 rounded-lg shadow text-center">
    <h3 className="text-gray-500">Stars</h3>
    <p className="text-2xl font-bold">{displayStats.stars}</p>
  </div>

</div>
       <LanguageChart languages={languages} />

       <div className="mt-10 w-full max-w-5xl">
  <h2 className="text-3xl font-bold mb-4">
    Repositories
  </h2>

  <div className="grid md:grid-cols-2 gap-4">

    {repos.map((repo) => (
      <div
        key={repo.name}
        className="bg-white p-4 rounded-lg shadow"
      >
        <h3 className="font-bold text-xl">
          {repo.name}
        </h3>

        <p className="text-gray-600 mt-2">
  {repo.description || "No description available"}
</p>

        <p>{repo.language}</p>

        <p>⭐ {repo.stars}</p>

        <a
          href={repo.url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-500"
        >
          View Repository
        </a>
      </div>
    ))}

   

  </div>
   <ContributionChart contributions={contributions} />
</div>
      </div>
    </div>
  );
}

export default App;