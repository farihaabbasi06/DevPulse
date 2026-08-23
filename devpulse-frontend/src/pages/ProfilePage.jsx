import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import DevCard from "../components/DevCard";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function ProfilePage() {
  const { username } = useParams();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [languages, setLanguages] = useState({});
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    axios
      .get(`${API_URL}/user/${username}`)
      .then((res) => {
        setUser(res.data);

        axios
          .get(`${API_URL}/repos/${username}`)
          .then((repoRes) => {
            const repos = repoRes.data;

            let langCount = {};

            repos.repos.forEach((repo) => {
              repo.languages.forEach((lang) => {
                langCount[lang] = (langCount[lang] || 0) + 1;
              });
            });

            setLanguages(langCount);

            axios
              .get(`${API_URL}/commits/${username}`)
              .then((res) => {
                setStats((prev) => ({
                  ...prev,
                  commits: res.data.totalCommits,
                }));
              });

            axios
              .get(`${API_URL}/pullrequests/${username}`)
              .then((res) => {
                setStats((prev) => ({
                  ...prev,
                  prs: res.data.totalPullRequests,
                }));
              });

            setStats({
              repos: repos.totalRepos,
              stars: repos.totalStars,
            });
          });
      })
      .catch((err) => {
        //setError("Unable to load profile.");
      });
  }, [username]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  if (!user) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${
        theme === "dark" ? "bg-[#0B0C10]" : "bg-[#FAFAFB]"
      }`}>
        <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="mt-3 text-indigo-400 font-medium text-xs">
          Loading developer profile...
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center relative transition-colors duration-300 px-4 py-12 ${
      theme === "dark" ? "bg-[#0B0C10]" : "bg-[#FAFAFB]"
    }`}>
      <button
        onClick={toggleTheme}
        className={`absolute top-6 right-6 p-2 rounded-lg border transition-colors duration-200 ${
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

      <div className="w-full max-w-md">
        <DevCard
          user={user}
          stats={stats}
          languages={languages}
          theme="indigo"
          globalTheme={theme}
        />
      </div>

      <div className="mt-6 flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <span className="h-1 w-1 rounded-full bg-indigo-500"></span>
        <span>Powered by</span>
        <span className="text-indigo-500 font-semibold">DevPulse</span>
      </div>
    </div>
  );
}

export default ProfilePage;