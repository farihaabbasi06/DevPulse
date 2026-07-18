import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
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
  const [cardTheme, setCardTheme] = useState("pink");
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
              <div className={`min-h-screen transition-colors duration-500 pb-20 ${
                theme === "dark"
                  ? "bg-[#090A10] text-[#E2E8F0]"
                  : "bg-[#FFF9FA] text-[#334155]"
              }`}>
                
                {/* ── STEP 1: ONBOARDING SCREEN (if no user data is loaded) ── */}
                {!user ? (
                  <div className="min-h-screen flex items-center justify-center relative px-4 py-12">
                    {/* Floating Controls */}
                    <div className="absolute top-6 right-6 flex items-center gap-3">
                      <button
                        onClick={toggleTheme}
                        className={`p-2.5 rounded-xl border transition-all duration-300 hover:scale-110 active:scale-95 ${
                          theme === "dark"
                            ? "bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10"
                            : "bg-pink-50/50 border-pink-100 text-purple-600 hover:bg-pink-100"
                        }`}
                        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                      >
                        {theme === "dark" ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828 0l-.707-.707m12.02-12.02l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={handleLogout}
                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border border-red-500/20"
                      >
                        Logout
                      </button>
                    </div>

                    {/* Welcoming search card */}
                    <div className={`p-8 rounded-3xl border w-full max-w-md shadow-2xl text-center transition-all duration-300 hover:scale-[1.01] ${
                      theme === "dark"
                        ? "bg-[#12131C]/90 border-white/5 text-white"
                        : "bg-white border-pink-100 text-slate-700 shadow-pink-100/30"
                    }`}>
                      <div className="inline-flex items-center gap-1.5 justify-center mb-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-pink-500 animate-ping"></span>
                        <h1 className="text-xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent tracking-tight">
                          DevPulse
                        </h1>
                      </div>
                      
                      <h2 className="text-3xl font-extrabold tracking-tight mb-2">Let's Get Started</h2>
                      <p className={`text-xs mb-6 max-w-xs mx-auto ${
                        theme === "dark" ? "text-gray-400" : "text-slate-500"
                      }`}>
                        Enter your GitHub username below to aggregate analytics, calculate your pulse rank, and build your resume.
                      </p>

                      <div className={`p-1.5 rounded-2xl flex items-center w-full shadow-md transition-all duration-300 mb-5 ${
                        theme === "dark"
                          ? "bg-white/5 border border-white/10 focus-within:border-pink-500/50 focus-within:ring-2 focus-within:ring-pink-500/10"
                          : "bg-slate-50 border border-pink-100 focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-400/10"
                      }`}>
                        <span className="pl-3.5 text-gray-400">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          placeholder="GitHub username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="bg-transparent border-0 outline-none focus:ring-0 text-inherit px-2.5 py-3 w-full text-base font-semibold placeholder-gray-500"
                        />
                      </div>

                      <button
                        onClick={searchUser}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-extrabold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-98 disabled:opacity-50 ${
                          theme === "dark"
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-500/25"
                            : "bg-gradient-to-r from-pink-400 to-purple-500 shadow-pink-200"
                        }`}
                      >
                        {loading ? "Analyzing..." : "Generate Portfolio"}
                      </button>

                      {loading && (
                        <div className="mt-6 flex flex-col items-center animate-pulse">
                          <div className="relative flex items-center justify-center">
                            <div className="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
                          </div>
                          <p className="mt-3 text-pink-400 font-bold text-xs">
                            Fetching GitHub data...
                          </p>
                        </div>
                      )}

                      {error && (
                        <div className={`mt-5 border rounded-xl p-3.5 text-xs font-bold ${
                          theme === "dark"
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : "bg-red-50 border-red-100 text-red-600"
                        }`}>
                          <div className="flex items-center gap-2 justify-center">
                            <span>⚠️</span>
                            <p>{error}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  
                  /* ── STEP 2: FULL ANALYTICS DASHBOARD SCREEN (once user exists) ── */
                  <div className="animate-fade-in">
                    {/* Floating Modern Navbar */}
                    <header className="sticky top-0 z-50 px-4 py-3 backdrop-blur-md border-b border-opacity-10 border-slate-500">
                      <div className={`max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-4 py-2.5 rounded-2xl transition-all duration-300 ${
                        theme === "dark"
                          ? "bg-white/5 border border-white/5 text-white"
                          : "bg-white/80 border border-pink-100 text-slate-700 shadow-md shadow-pink-100/30"
                      }`}>
                        
                        {/* Brand Logo with Pulsing Indicator */}
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                          </span>
                          <h1 className="text-2xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent tracking-tight">
                            DevPulse
                          </h1>
                        </div>

                        {/* Nav Tabs */}
                        <div className="flex flex-wrap justify-center items-center gap-2">
                          <button
                            onClick={() => setActiveTab("dashboard")}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                              activeTab === "dashboard"
                                ? theme === "dark"
                                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20 scale-105"
                                  : "bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-md shadow-pink-200 scale-105"
                                : theme === "dark"
                                  ? "text-gray-400 hover:text-white hover:bg-white/5"
                                  : "text-slate-500 hover:text-slate-800 hover:bg-pink-50/50"
                            }`}
                          >
                            Dashboard
                          </button>

                          <button
                            onClick={() => setActiveTab("devcard")}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                              activeTab === "devcard"
                                ? theme === "dark"
                                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20 scale-105"
                                  : "bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-md shadow-pink-200 scale-105"
                                : theme === "dark"
                                  ? "text-gray-400 hover:text-white hover:bg-white/5"
                                  : "text-slate-500 hover:text-slate-800 hover:bg-pink-50/50"
                            }`}
                          >
                            Dev Card
                          </button>

                          <button
                            onClick={() => setActiveTab("resume")}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                              activeTab === "resume"
                                ? theme === "dark"
                                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20 scale-105"
                                  : "bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-md shadow-pink-200 scale-105"
                                : theme === "dark"
                                  ? "text-gray-400 hover:text-white hover:bg-white/5"
                                  : "text-slate-500 hover:text-slate-800 hover:bg-pink-50/50"
                            }`}
                          >
                            Resume
                          </button>
                        </div>

                        {/* Action Panel: Reset Search, Theme toggle & Logout */}
                        <div className="flex items-center gap-3">
                          {/* Search Another User Button */}
                          <button
                            onClick={() => {
                              setUser(null);
                              setUsername("");
                              setError("");
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition-all duration-300 hover:scale-[1.03] active:scale-97 ${
                              theme === "dark"
                                ? "bg-white/5 border-white/10 text-pink-400 hover:bg-white/10"
                                : "bg-pink-50/50 border-pink-100 text-pink-500 hover:bg-pink-100"
                            }`}
                            title="Analyze different username"
                          >
                            Search New
                          </button>

                          {/* Theme Toggle */}
                          <button
                            onClick={toggleTheme}
                            className={`p-2.5 rounded-xl border transition-all duration-300 hover:scale-110 active:scale-95 ${
                              theme === "dark"
                                ? "bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10"
                                : "bg-pink-50/50 border-pink-100 text-purple-600 hover:bg-pink-100/50"
                            }`}
                            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                          >
                            {theme === "dark" ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828 0l-.707-.707m12.02-12.02l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                              </svg>
                            )}
                          </button>

                          {/* Logout */}
                          <button
                            onClick={handleLogout}
                            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border border-red-500/20"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    </header>

                    {/* Main Content Layout */}
                    <main className="max-w-6xl mx-auto px-4 mt-8 flex flex-col items-center">
                      
                      {/* Active Tab Content Render */}
                      {activeTab === "dashboard" && (
                        <div className="w-full flex flex-col items-center">
                          {/* User Profile Card */}
                          <div className={`p-6 mt-4 rounded-2xl shadow-xl w-full max-w-md text-center transition-all duration-300 border hover:scale-[1.01] ${
                            theme === "dark"
                              ? "bg-[#12131C]/90 border-white/5 text-white"
                              : "bg-white border-pink-50 text-slate-700 shadow-pink-100/30"
                          }`}>
                            <div className="relative inline-block mx-auto mb-4">
                              <img
                                src={user.avatar}
                                alt="avatar"
                                className={`w-28 h-28 rounded-full object-cover p-1 ring-4 ${
                                  theme === "dark"
                                    ? "ring-pink-500/30 bg-gradient-to-tr from-pink-500 to-purple-600"
                                    : "ring-pink-300/40 bg-gradient-to-tr from-pink-400 to-purple-500"
                                }`}
                              />
                            </div>

                            <h2 className="text-2xl font-black mb-1 tracking-tight">
                              {user.name}
                            </h2>
                            <p className={`text-sm mb-3 ${theme === "dark" ? "text-pink-400" : "text-pink-500"}`}>
                              @{user.username}
                            </p>
                            
                            {user.bio && (
                              <p className={`text-sm italic mb-4 max-w-sm mx-auto px-4 ${
                                theme === "dark" ? "text-gray-400" : "text-slate-500"
                              }`}>
                                "{user.bio}"
                              </p>
                            )}

                            <div className="grid grid-cols-2 gap-3 py-3 border-y border-opacity-10 mb-4 border-slate-500">
                              <div>
                                <span className="block text-xs uppercase tracking-wider text-gray-400">Followers</span>
                                <span className="text-base font-bold">{user.followers}</span>
                              </div>
                              <div>
                                <span className="block text-xs uppercase tracking-wider text-gray-400">Location</span>
                                <span className="text-base font-bold truncate max-w-[150px] inline-block">{user.location || "Remote"}</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-pink-500/5 border border-pink-500/10 mb-3">
                              <span className="text-xs uppercase tracking-widest text-pink-400 font-bold">Reputation Score</span>
                              <span className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                                {user ? user.score : 0}<span className="text-sm font-normal text-gray-400">/100</span>
                              </span>
                            </div>

                            <p className="text-xs text-gray-400">
                              Joined: {new Date(user.joined).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Stat Grid with Count Up Display */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 w-full max-w-5xl px-4">
                            {/* Commits */}
                            <div className={`p-5 rounded-2xl shadow-sm text-center border-t-4 border-t-orange-500 transition-all duration-300 hover:-translate-y-1 ${
                              theme === "dark"
                                ? "bg-[#12131C]/60 border-x-white/5 border-b-white/5"
                                : "bg-white border-x-pink-50 border-b-pink-50 shadow-pink-100/20"
                            }`}>
                              <div className="text-orange-500 mb-1 flex justify-center">
                                <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                </svg>
                              </div>
                              <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                                Commits
                              </h3>
                              <p className="text-3xl font-extrabold mt-1">
                                {displayStats.commits}
                              </p>
                            </div>

                            {/* Repos */}
                            <div className={`p-5 rounded-2xl shadow-sm text-center border-t-4 border-t-blue-500 transition-all duration-300 hover:-translate-y-1 ${
                              theme === "dark"
                                ? "bg-[#12131C]/60 border-x-white/5 border-b-white/5"
                                : "bg-white border-x-pink-50 border-b-pink-50 shadow-pink-100/20"
                            }`}>
                              <div className="text-blue-500 mb-1 flex justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
                                </svg>
                              </div>
                              <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                                Repos
                              </h3>
                              <p className="text-3xl font-extrabold mt-1">
                                {displayStats.repos}
                              </p>
                            </div>

                            {/* PRs */}
                            <div className={`p-5 rounded-2xl shadow-sm text-center border-t-4 border-t-green-500 transition-all duration-300 hover:-translate-y-1 ${
                              theme === "dark"
                                ? "bg-[#12131C]/60 border-x-white/5 border-b-white/5"
                                : "bg-white border-x-pink-50 border-b-pink-50 shadow-pink-100/20"
                            }`}>
                              <div className="text-green-500 mb-1 flex justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                              </div>
                              <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                                PRs
                              </h3>
                              <p className="text-3xl font-extrabold mt-1">
                                {displayStats.prs}
                              </p>
                            </div>

                            {/* Stars */}
                            <div className={`p-5 rounded-2xl shadow-sm text-center border-t-4 border-t-yellow-500 transition-all duration-300 hover:-translate-y-1 ${
                              theme === "dark"
                                ? "bg-[#12131C]/60 border-x-white/5 border-b-white/5"
                                : "bg-white border-x-pink-50 border-b-pink-50 shadow-pink-100/20"
                            }`}>
                              <div className="text-yellow-500 mb-1 flex justify-center">
                                <svg className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.17 0l-3.971 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 9.72c-.783-.57-.38-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                              </div>
                              <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                                Stars
                              </h3>
                              <p className="text-3xl font-extrabold mt-1">
                                {displayStats.stars}
                              </p>
                            </div>
                          </div>

                          {/* Charts and Visual Analytics */}
                          <div className="w-full max-w-5xl mt-12 px-4 grid grid-cols-1 gap-8">
                            {/* Language Distribution Card */}
                            <div className={`p-6 rounded-2xl border transition-all duration-300 ${
                              theme === "dark"
                                ? "bg-[#12131C]/80 border-white/5 shadow-2xl shadow-[#040407]"
                                : "bg-white border-pink-100 shadow-xl shadow-pink-100/20"
                            }`}>
                              <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                                Primary Languages
                              </h3>
                              <LanguageChart languages={languages} theme={theme} />
                            </div>

                            {/* Reputation Score Ring Card */}
                            <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 ${
                              theme === "dark"
                                ? "bg-[#12131C]/80 border-white/5"
                                : "bg-white border-pink-100 shadow-xl shadow-pink-100/20"
                            }`}>
                              <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent w-full text-left">
                                Developer Analytics Score
                              </h3>
                              <ScoreRing score={user.score} theme={theme} />
                            </div>

                            {/* Repositories List */}
                            <div className="mt-4">
                              <h2 className="text-2xl font-black mb-6 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                                Repositories
                              </h2>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {repos.map((repo) => (
                                  <div
                                    key={repo.name}
                                    className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg ${
                                      theme === "dark"
                                        ? "bg-[#12131C]/80 border-white/5 hover:border-pink-500/30 hover:shadow-pink-500/5 text-white"
                                        : "bg-white border-pink-100 hover:border-pink-300 hover:shadow-pink-100/40 text-slate-700"
                                    }`}
                                  >
                                    <div>
                                      <h3 className="font-extrabold text-lg tracking-tight truncate">
                                        {repo.name}
                                      </h3>
                                      <p className={`text-sm mt-2 line-clamp-2 min-h-[40px] ${
                                        theme === "dark" ? "text-gray-400" : "text-slate-500"
                                      }`}>
                                        {repo.description || "No description available"}
                                      </p>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-opacity-10 border-slate-500 flex justify-between items-center text-xs font-semibold">
                                      <div className="flex items-center gap-3">
                                        {repo.language && (
                                          <span className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block"></span>
                                            {repo.language}
                                          </span>
                                        )}
                                        <span className="flex items-center gap-1 text-yellow-500">
                                          ⭐ {repo.stars}
                                        </span>
                                      </div>
                                      <a
                                        href={repo.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-pink-500 hover:text-pink-600 transition-colors flex items-center gap-1"
                                      >
                                        View Repo
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Contribution Activity Card */}
                            <div className={`p-6 rounded-2xl border transition-all duration-300 ${
                              theme === "dark"
                                ? "bg-[#12131C]/80 border-white/5 shadow-2xl shadow-[#040407]"
                                : "bg-white border-pink-100 shadow-xl shadow-pink-100/20"
                            }`}>
                              <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                                Contribution Activity (6 Months)
                              </h3>
                              <ContributionChart contributions={contributions} theme={theme} />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dev Card Tab Content */}
                      {activeTab === "devcard" && (
                        <div className="w-full flex flex-col items-center mt-6">
                          
                          {/* Card Presentation */}
                          <div className="w-full flex justify-center py-4">
                            <DevCard
                              user={user}
                              stats={stats}
                              languages={languages}
                              theme={cardTheme}
                              globalTheme={theme}
                            />
                          </div>

                          {/* Theme Pickers */}
                          <div className={`mt-8 p-4 rounded-2xl flex flex-col items-center gap-3 w-full max-w-sm border ${
                            theme === "dark" ? "bg-white/5 border-white/5" : "bg-white border-pink-100 shadow-sm"
                          }`}>
                            <span className="text-xs uppercase tracking-widest font-bold text-gray-400">Card Design Template</span>
                            <div className="flex justify-center gap-3">
                              <button
                                onClick={() => setCardTheme("pink")}
                                className={`px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                                  cardTheme === "pink" ? "bg-pink-500 ring-2 ring-pink-500 ring-offset-2 ring-offset-inherit" : "bg-pink-500/80"
                                }`}
                              >
                                Pink Neon
                              </button>

                              <button
                                onClick={() => setCardTheme("navy")}
                                className={`px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                                  cardTheme === "navy" ? "bg-slate-800 ring-2 ring-slate-800 ring-offset-2 ring-offset-inherit" : "bg-slate-800/80"
                                }`}
                              >
                                Midnight Navy
                              </button>

                              <button
                                onClick={() => setCardTheme("purple")}
                                className={`px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                                  cardTheme === "purple" ? "bg-purple-700 ring-2 ring-purple-700 ring-offset-2 ring-offset-inherit" : "bg-purple-700/80"
                                }`}
                              >
                                Cyber Purple
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Resume Tab Content */}
                      {activeTab === "resume" && (
                        <div className="w-full flex justify-center mt-6">
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
