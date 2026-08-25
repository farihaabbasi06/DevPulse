import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import LanguageChart from "./components/LanguageChart";
import AchievementBadges from "./components/AchievementBadges";
import RepositoryHealth from "./components/RepositoryHealth";
import ActivityInsights from "./components/ActivityInsights";
import ContributionHeatmap from "./components/ContributionHeatmap";
import ScoreRing from "./components/ScoreRing";
import DevCard from "./components/DevCard";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import ProfilePage from "./pages/ProfilePage";
import PortfolioPage from "./pages/PortfolioPage";
import Resume from "./components/Resume";
import Login from "./pages/Login";
import Register from "./pages/Register";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const stored = localStorage.getItem("token");
    setToken(stored);
  }, []);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contributions, setContributions] = useState({});
  const [cardTheme, setCardTheme] = useState("indigo");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark"); // Synchronized theme

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

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
        `${API_URL}/user/${username}`
      );

      setUser(response.data);

      const reposResponse = await axios.get(
        `${API_URL}/repos/${username}`
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
        `${API_URL}/pullrequests/${username}`
      );

      const commitsResponse = await axios.get(
        `${API_URL}/commits/${username}`
      );

      const contributionResponse = await axios.get(
        `${API_URL}/contributions/${username}`
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
      if (err.response?.status === 404) {
        setError("GitHub user not found.");
      } else {
        setError("Something went wrong. Please try again.");
      }
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

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            token ? (
              <div className={`min-h-screen transition-colors duration-300 pb-16 ${
                theme === "dark"
                  ? "bg-[#0B0C10] text-slate-200"
                  : "bg-[#FAFAFB] text-slate-700"
              }`}>

                {/* ── STEP 1: ONBOARDING SCREEN (if no user data is loaded) ── */}
                {!user ? (
                  <div className="min-h-screen flex items-center justify-center relative px-4 py-12">
                    {/* Floating Controls */}
                    <div className="absolute top-6 right-6 flex items-center gap-2">
                      <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-lg border transition-colors duration-200 ${
                          theme === "dark"
                            ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                      >
                        {theme === "dark" ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828 0l-.707-.707m12.02-12.02l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={handleLogout}
                        className="px-3 py-2 rounded-lg text-xs font-medium text-red-500 border border-red-500/20 hover:bg-red-500/10 transition-colors duration-200"
                      >
                        Logout
                      </button>
                    </div>

                    {/* Welcoming search card */}
                    <div className={`p-8 rounded-xl border w-full max-w-sm text-center transition-colors duration-300 ${
                      theme === "dark"
                        ? "bg-[#12131A] border-white/[0.06]"
                        : "bg-white border-slate-200 shadow-sm"
                    }`}>
                      <div className="inline-flex items-center gap-1.5 justify-center mb-4">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                        <h1 className="text-sm font-semibold tracking-tight text-indigo-500">
                          DevPulse
                        </h1>
                      </div>

                      <h2 className="text-xl font-semibold tracking-tight mb-1.5">Let's get started</h2>
                      <p className={`text-xs mb-6 leading-relaxed ${
                        theme === "dark" ? "text-slate-400" : "text-slate-500"
                      }`}>
                        Enter a GitHub username to pull analytics, calculate a reputation score, and build a resume.
                      </p>

                      <div className={`flex items-center w-full rounded-lg mb-3 transition-colors duration-200 ${
                        theme === "dark"
                          ? "bg-white/[0.03] border border-white/10 focus-within:border-indigo-500/50"
                          : "bg-slate-50 border border-slate-200 focus-within:border-indigo-300"
                      }`}>
                        <span className="pl-3 text-slate-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          placeholder="GitHub username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="bg-transparent border-0 outline-none focus:ring-0 text-inherit px-2.5 py-2.5 w-full text-sm font-medium placeholder-slate-400"
                        />
                      </div>

                      <button
                        onClick={searchUser}
                        disabled={loading}
                        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-200 disabled:opacity-50"
                      >
                        {loading ? "Analyzing..." : "Generate Portfolio"}
                      </button>

                      {loading && (
                        <div className="mt-5 flex flex-col items-center">
                          <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                          <p className="mt-2.5 text-indigo-400 font-medium text-[11px]">
                            Fetching GitHub data...
                          </p>
                        </div>
                      )}

                      {error && (
                        <div className={`mt-4 border rounded-lg p-2.5 text-xs font-medium ${
                          theme === "dark"
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : "bg-red-50 border-red-100 text-red-600"
                        }`}>
                          {error}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (

                  /* ── STEP 2: FULL ANALYTICS DASHBOARD SCREEN (once user exists) ── */
                  <div>
                    {/* Navbar */}
                    <header className="sticky top-0 z-50 px-4 py-3 border-b border-opacity-10 border-slate-500">
                      <div className={`max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 px-4 py-2 rounded-xl transition-colors duration-300 ${
                        theme === "dark"
                          ? "bg-[#0B0C10]/95 border border-white/[0.06]"
                          : "bg-white border border-slate-200 shadow-sm"
                      }`}>

                        {/* Brand Logo */}
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                          <h1 className="text-base font-semibold tracking-tight text-indigo-500">
                            DevPulse
                          </h1>
                        </div>

                        {/* Nav Tabs */}
                        <div className="flex flex-wrap justify-center items-center gap-1">
                          <button
                            onClick={() => setActiveTab("dashboard")}
                            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                              activeTab === "dashboard"
                                ? "bg-indigo-500 text-white"
                                : theme === "dark"
                                  ? "text-slate-400 hover:text-white hover:bg-white/5"
                                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                            }`}
                          >
                            Dashboard
                          </button>

                          <button
                            onClick={() => setActiveTab("devcard")}
                            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                              activeTab === "devcard"
                                ? "bg-indigo-500 text-white"
                                : theme === "dark"
                                  ? "text-slate-400 hover:text-white hover:bg-white/5"
                                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                            }`}
                          >
                            Dev Card
                          </button>

                          <button
                            onClick={() => setActiveTab("resume")}
                            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                              activeTab === "resume"
                                ? "bg-indigo-500 text-white"
                                : theme === "dark"
                                  ? "text-slate-400 hover:text-white hover:bg-white/5"
                                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                            }`}
                          >
                            Resume
                          </button>
                        </div>

                        {/* Action Panel */}
                        <div className="flex items-center gap-2">
                          <a
                            href={`/portfolio/${username}`}
                            target="_blank"
                            rel="noreferrer"
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-200 ${
                              theme === "dark"
                                ? "bg-white/5 border-white/10 text-indigo-400 hover:bg-white/10"
                                : "bg-white border-slate-200 text-indigo-500 hover:bg-slate-50"
                            }`}
                            title="Open your public portfolio page"
                          >
                            View Portfolio
                          </a>

                          <button
                            onClick={() => {
                              setUser(null);
                              setUsername("");
                              setError("");
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-200 ${
                              theme === "dark"
                                ? "bg-white/5 border-white/10 text-indigo-400 hover:bg-white/10"
                                : "bg-white border-slate-200 text-indigo-500 hover:bg-slate-50"
                            }`}
                            title="Analyze different username"
                          >
                            Search New
                          </button>

                          <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg border transition-colors duration-200 ${
                              theme === "dark"
                                ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                          >
                            {theme === "dark" ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828 0l-.707-.707m12.02-12.02l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                              </svg>
                            )}
                          </button>

                          <button
                            onClick={handleLogout}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 border border-red-500/20 hover:bg-red-500/10 transition-colors duration-200"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    </header>

                    {/* Main Content Layout */}
                    <main className="max-w-5xl mx-auto px-4 mt-6 flex flex-col items-center">

                      {/* ── Dashboard Tab ── */}
                      {activeTab === "dashboard" && (
                        <div className="w-full flex flex-col items-center">

                          {/* Profile + Score row — single source of truth for the score,
                              no duplicate reputation display further down the page */}
                          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 w-full max-w-4xl mt-2">
                            <div className={`p-5 rounded-xl border flex flex-col md:flex-row items-center md:items-start gap-4 transition-colors duration-300 ${
                              theme === "dark"
                                ? "bg-[#12131A] border-white/[0.06]"
                                : "bg-white border-slate-200 shadow-sm"
                            }`}>
                              <img
                                src={user.avatar}
                                alt="avatar"
                                className="w-16 h-16 rounded-full object-cover border border-indigo-500/30"
                              />
                              <div className="text-center md:text-left flex-1">
                                <h2 className="text-lg font-semibold tracking-tight">
                                  {user.name}
                                </h2>
                                <p className="text-xs font-medium text-indigo-500">
                                  @{user.username}
                                </p>
                                {user.bio && (
                                  <p className={`text-xs mt-1.5 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                                    {user.bio}
                                  </p>
                                )}
                                <div className="flex gap-5 mt-3 justify-center md:justify-start">
                                  <div>
                                    <span className="block text-[10px] uppercase tracking-wide text-slate-400">Followers</span>
                                    <span className="text-sm font-semibold">{user.followers}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[10px] uppercase tracking-wide text-slate-400">Location</span>
                                    <span className="text-sm font-semibold">{user.location || "Remote"}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[10px] uppercase tracking-wide text-slate-400">Joined</span>
                                    <span className="text-sm font-semibold">{new Date(user.joined).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className={`p-4 rounded-xl border flex items-center justify-center transition-colors duration-300 ${
                              theme === "dark"
                                ? "bg-[#12131A] border-white/[0.06]"
                                : "bg-white border-slate-200 shadow-sm"
                            }`}>
                              <ScoreRing score={user.score} theme={theme} />
                            </div>
                          </div>

                          {/* Stat Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 w-full max-w-4xl">
                            {[
                              { label: "Commits", value: displayStats.commits },
                              { label: "Repos", value: displayStats.repos },
                              { label: "PRs", value: displayStats.prs },
                              { label: "Stars", value: displayStats.stars },
                            ].map(({ label, value }) => (
                              <div
                                key={label}
                                className={`p-4 rounded-xl text-center border-t-2 border-t-indigo-500 transition-colors duration-300 ${
                                  theme === "dark"
                                    ? "bg-[#12131A] border-x border-b border-x-white/[0.06] border-b-white/[0.06]"
                                    : "bg-white border-x border-b border-x-slate-200 border-b-slate-200 shadow-sm"
                                }`}
                              >
                                <h3 className={`text-[10px] font-medium uppercase tracking-wide ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                                  {label}
                                </h3>
                                <p className="text-2xl font-semibold mt-1">
                                  {value}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Achievements + Activity Insights */}
                          <div className="w-full max-w-4xl mt-4 grid grid-cols-1 gap-4">
                            <AchievementBadges stats={stats} languages={languages} repos={repos} user={user} theme={theme} />
                            <ActivityInsights username={user?.username} theme={theme} />
                            <RepositoryHealth username={user?.username} theme={theme} />
                          </div>

                          {/* Charts and Analytics */}
                          <div className="w-full max-w-4xl mt-6 grid grid-cols-1 gap-4">
                            <div className={`p-5 rounded-xl border transition-colors duration-300 ${
                              theme === "dark"
                                ? "bg-[#12131A] border-white/[0.06]"
                                : "bg-white border-slate-200 shadow-sm"
                            }`}>
                              <h3 className="text-sm font-semibold mb-3 text-slate-400">
                                Primary Languages
                              </h3>
                              <LanguageChart languages={languages} theme={theme} />
                            </div>

                            {/* Repositories */}
                            <div>
                              <h2 className="text-sm font-semibold mb-3 text-slate-400">
                                Repositories
                              </h2>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {repos.map((repo) => (
                                  <div
                                    key={repo.name}
                                    className={`p-4 rounded-xl border transition-colors duration-200 flex flex-col justify-between ${
                                      theme === "dark"
                                        ? "bg-[#12131A] border-white/[0.06] hover:border-indigo-500/30"
                                        : "bg-white border-slate-200 hover:border-indigo-300 shadow-sm"
                                    }`}
                                  >
                                    <div>
                                      <h3 className="font-semibold text-sm truncate">
                                        {repo.name}
                                      </h3>
                                      <p className={`text-xs mt-1.5 line-clamp-2 min-h-[32px] ${
                                        theme === "dark" ? "text-slate-400" : "text-slate-500"
                                      }`}>
                                        {repo.description || "No description available"}
                                      </p>
                                    </div>

                                    <div className="mt-3 pt-2.5 border-t border-opacity-10 border-slate-500 flex justify-between items-center text-xs font-medium">
                                      <div className="flex items-center gap-3">
                                        {repo.language && (
                                          <span className="flex items-center gap-1.5 text-slate-400">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
                                            {repo.language}
                                          </span>
                                        )}
                                        <span className="flex items-center gap-1 text-yellow-500">
                                          ★ {repo.stars}
                                        </span>
                                      </div>
                                      <a
                                        href={repo.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-indigo-500 hover:text-indigo-600 transition-colors"
                                      >
                                        View →
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Contribution Activity — GitHub-style heatmap */}
                            <ContributionHeatmap username={user?.username} theme={theme} />
                          </div>
                        </div>
                      )}

                      {/* ── Dev Card Tab ── */}
                      {activeTab === "devcard" && (
                        <div className="w-full flex flex-col items-center mt-4">
                          <div className="w-full flex justify-center py-2">
                            <DevCard
                              user={user}
                              stats={stats}
                              languages={languages}
                              theme={cardTheme}
                              globalTheme={theme}
                            />
                          </div>

                          <div className={`mt-6 p-3.5 rounded-xl flex flex-col items-center gap-2.5 w-full max-w-xs border transition-colors duration-300 ${
                            theme === "dark" ? "bg-white/[0.03] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"
                          }`}>
                            <span className="text-[9px] uppercase tracking-wide font-medium text-slate-400">Card Design Template</span>
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => setCardTheme("indigo")}
                                className={`px-3 py-1 rounded-full text-[11px] font-medium text-white transition-colors duration-200 ${
                                  cardTheme === "indigo" ? "bg-indigo-500 ring-2 ring-indigo-500/40 ring-offset-2 ring-offset-inherit" : "bg-indigo-500/70"
                                }`}
                              >
                                Indigo
                              </button>

                              <button
                                onClick={() => setCardTheme("navy")}
                                className={`px-3 py-1 rounded-full text-[11px] font-medium text-white transition-colors duration-200 ${
                                  cardTheme === "navy" ? "bg-slate-700 ring-2 ring-slate-700/40 ring-offset-2 ring-offset-inherit" : "bg-slate-700/70"
                                }`}
                              >
                                Navy
                              </button>

                              <button
                                onClick={() => setCardTheme("purple")}
                                className={`px-3 py-1 rounded-full text-[11px] font-medium text-white transition-colors duration-200 ${
                                  cardTheme === "purple" ? "bg-purple-600 ring-2 ring-purple-600/40 ring-offset-2 ring-offset-inherit" : "bg-purple-600/70"
                                }`}
                              >
                                Purple
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── Resume Tab ── */}
                      {activeTab === "resume" && (
                        <div className="w-full flex justify-center mt-4">
                          <Resume
                            user={user}
                            stats={stats}
                            languages={languages}
                            repos={repos}
                            globalTheme={theme}
                          />
                        </div>
                      )}

                    </main>
                  </div>
                )}
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/portfolio/:username" element={<PortfolioPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;