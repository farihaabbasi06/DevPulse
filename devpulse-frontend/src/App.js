import { useState, useEffect } from "react";
import axios from "axios";
import LanguageChart from "./components/LanguageChart";
import ContributionChart from "./components/ContributionChart";
import ScoreRing from "./components/ScoreRing";
import DevCard from "./components/DevCard";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import ProfilePage from "./pages/ProfilePage";
import Resume from "./components/Resume";
import Login from "./pages/Login";
import Register from "./pages/Register";


function App() {
const token = localStorage.getItem("token");
const [activeTab, setActiveTab] = useState("dashboard");
 const [username, setUsername] = useState("");
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [contributions, setContributions] = useState({});
const [cardTheme, setCardTheme] = useState("pink");

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

    console.log(response.data.score);

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

setDisplayStats({
  commits: 0,
  repos: 0,
  prs: 0,
  stars: 0
});

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

     <BrowserRouter>

    <Routes>

      <Route
        path="/"
        element={
          
           <div className="min-h-screen bg-black text-white">

      <nav className="bg-black text-white p-4 flex flex-col md:flex-row justify-between items-center gap-4">
  <h1 className="text-2xl font-bold text-pink-500">
    DevPulse
  </h1>

  <div className="flex flex-wrap justify-center gap-4">
    <button
      onClick={() => setActiveTab("dashboard")}
      className={`px-4 py-2 rounded-lg ${
        activeTab === "dashboard"
          ? "bg-pink-500"
          : "hover:bg-gray-800"
      }`}
    >
      Dashboard
    </button>

    <button
      onClick={() => setActiveTab("devcard")}
      className={`px-4 py-2 rounded-lg ${
        activeTab === "devcard"
          ? "bg-pink-500"
          : "hover:bg-gray-800"
      }`}
    >
      Dev Card
    </button>

    <button
      onClick={() => setActiveTab("resume")}
      className={`px-4 py-2 rounded-lg ${
        activeTab === "resume"
          ? "bg-pink-500"
          : "hover:bg-gray-800"
      }`}
    >
      Resume
    </button>
  </div>
</nav>

      <div className="flex flex-col items-center mt-20">

       <h1 className="text-3xl md:text-5xl font-bold mb-6 text-center text-pink-500">
  GitHub Developer Analytics
</h1>

        <input
          type="text"
          placeholder="Enter GitHub Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-gray-900 border border-pink-500 text-white p-3 w-full max-w-md rounded-lg"
        />

        <button
          onClick={searchUser}
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 mt-4 rounded-lg"
        >
          Search
        </button>

{loading && (
  <p className="mt-4 text-pink-400 font-semibold">
    Loading...
  </p>
)}

{error && (
  <p className="mt-4 text-red-400 font-semibold">
    {error}
  </p>
)}

{activeTab === "dashboard" && (
  <>
    {user && (
      <div className="bg-gray-900 border border-pink-500 p-6 mt-8 rounded-lg shadow-lg w-full max-w-md text-center">

        <img
          src={user.avatar}
          alt="avatar"
          className="w-32 rounded-full mx-auto"
        />

        <h2 className="text-3xl font-bold mb-4 text-pink-500">
          {user.name}
        </h2>

        <p>@{user.username}</p>
        <p>{user.bio}</p>

        <p>Followers: {user.followers}</p>

        <p className="text-pink-400 font-bold text-lg">
  
      Reputation Score: {user ? user.score : 0}/100
      
</p>

        <p>
          Joined: {new Date(user.joined).toLocaleDateString()}
        </p>

        <p>Location: {user.location}</p>

       
      </div>
    )}

   

    

 <div className="flex justify-center gap-3 mb-4">

  

</div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8 w-full max-w-5xl px-4">

      <div className="bg-gray-900 border border-pink-500 p-4 rounded-lg shadow text-center">
        <h3 className="text-pink-400">Commits</h3>
        <p className="text-2xl font-bold">
          {displayStats.commits}
        </p>
      </div>

      <div className="bg-gray-900 border border-pink-500 p-4 rounded-lg shadow text-center">
        <h3 className="text-pink-400">Repos</h3>
        <p className="text-2xl font-bold">
          {displayStats.repos}
        </p>
      </div>

      <div className="bg-gray-900 border border-pink-500 p-4 rounded-lg shadow text-center">
        <h3 className="text-pink-400">PRs</h3>
        <p className="text-2xl font-bold">
          {displayStats.prs}
        </p>
      </div>

      <div className="bg-gray-900 border border-pink-500 p-4 rounded-lg shadow text-center">
        <h3 className="text-pink-400">Stars</h3>
        <p className="text-2xl font-bold">
          {displayStats.stars}
        </p>
      </div>

    </div>

    <LanguageChart languages={languages} />

    {user && (
  <div className="mt-10 flex justify-center">
    <ScoreRing score={user.score} />
  </div>
)}

    <div className="mt-10 w-full max-w-5xl">

      <h2 className="text-3xl font-bold mb-4 text-pink-500">
  Repositories
</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {repos.map((repo) => (
          <div
            key={repo.name}
            className="bg-gray-900 border border-pink-500 p-4 rounded-lg shadow"
          >

            <h3 className="font-bold text-xl">
              {repo.name}
            </h3>

            <p className="text-gray-300 mt-2">
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
  </>
)}

{activeTab === "devcard" && (
  <>
    <DevCard
      user={user}
      stats={stats}
      languages={languages}
      theme={cardTheme}
    />

    <div className="flex justify-center gap-3 mt-6">
      <button
        onClick={() => setCardTheme("pink")}
        className="bg-pink-500 px-4 py-2 rounded"
      >
        Pink
      </button>

      <button
        onClick={() => setCardTheme("navy")}
        className="bg-blue-900 px-4 py-2 rounded"
      >
        Navy
      </button>

      <button
        onClick={() => setCardTheme("purple")}
        className="bg-purple-700 px-4 py-2 rounded"
      >
        Purple
      </button>
    </div>
  </>
)}

{activeTab === "resume" && (
  <Resume
  user={user}
  stats={stats}
  languages={languages}
  repos={repos}
/>
)}
       
</div>
      </div>
        }
      />

      <Route
  path="/profile/:username"
  element={<ProfilePage />}
/>


    </Routes>

  </BrowserRouter>
   
  
  );
}

export default App;