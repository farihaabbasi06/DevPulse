import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ScoreRing from "../components/ScoreRing";
import VerifiedBadge from "../components/VerifiedBadge";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function truncateAtWord(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  const trimmed = text.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(" ");
  return `${trimmed.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

function generateAboutSummary(user, stats, topLanguages) {
  const parts = [];
  if (user?.name) parts.push(`${user.name} is a software developer`);
  else parts.push("Software developer");
  if (stats?.repos) parts.push(`with ${stats.repos} public repositories on GitHub`);
  if (topLanguages?.length > 0) {
    parts.push(`, working primarily with ${topLanguages.slice(0, 3).join(", ")}`);
  }
  return `${parts.join(" ")}. ${stats?.commits ? `Has made ${stats.commits}+ commits ` : ""}${stats?.stars ? `and earned ${stats.stars} stars across open-source projects.` : "."}`;
}

// ── 3D tilt card ─────────────────────────────────────────────────
// Tracks mouse position within the card and rotates it in 3D space,
// with the shadow shifting opposite the tilt to sell the depth —
// the same technique Linear/Vercel/Stripe use on marketing pages.
function TiltCard({ children, isDark }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState("");
  const [shadow, setShadow] = useState("");

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    setTransform(`perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`);
    const shadowX = ((x - centerX) / centerX) * 10;
    const shadowY = ((y - centerY) / centerY) * 10;
    setShadow(`${shadowX}px ${shadowY + 14}px 28px -8px ${isDark ? "rgba(0,0,0,0.55)" : "rgba(30,30,60,0.18)"}`);
  };

  const handleMouseLeave = () => {
    setTransform("perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px)");
    setShadow(isDark ? "0 8px 20px -6px rgba(0,0,0,0.4)" : "0 8px 20px -6px rgba(30,30,60,0.1)");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transform || "perspective(700px) rotateX(0deg) rotateY(0deg)",
        boxShadow: shadow || (isDark ? "0 8px 20px -6px rgba(0,0,0,0.4)" : "0 8px 20px -6px rgba(30,30,60,0.1)"),
        transition: "transform 0.15s ease-out, box-shadow 0.15s ease-out",
        transformStyle: "preserve-3d",
      }}
      className={`rounded-xl border p-5 cursor-pointer ${
        isDark ? "bg-[#12131A] border-white/[0.07]" : "bg-white border-slate-200"
      }`}
    >
      {children}
    </div>
  );
}

function PortfolioPage() {
  const { username } = useParams();

  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [pinnedRepos, setPinnedRepos] = useState([]);
  const [refreshingPinned, setRefreshingPinned] = useState(false);
  const [languages, setLanguages] = useState({});
  const [stats, setStats] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [copied, setCopied] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/user/${username}`)
      .then((res) => {
        setUser(res.data);

        // Pinned repos — additive, separately wrapped so a user with
        // zero pins (most people) never breaks the rest of the page
        axios
          .get(`${API_URL}/pinned/${username}`)
          .then((res) => setPinnedRepos(res.data.pinned || []))
          .catch(() => setPinnedRepos([]));

        axios
          .get(`${API_URL}/repos/${username}`)
          .then((repoRes) => {
            const repoData = repoRes.data;
            setRepos(repoData.repos);

            const langCount = {};
            repoData.repos.forEach((repo) => {
              repo.languages.forEach((lang) => {
                langCount[lang] = (langCount[lang] || 0) + 1;
              });
            });
            setLanguages(langCount);

            axios.get(`${API_URL}/commits/${username}`).then((res) => {
              setStats((prev) => ({ ...prev, commits: res.data.totalCommits }));
            });

            axios.get(`${API_URL}/pullrequests/${username}`).then((res) => {
              setStats((prev) => ({ ...prev, prs: res.data.totalPullRequests }));
            });

            setStats({
              repos: repoData.totalRepos,
              stars: repoData.totalStars,
            });
          });
      })
      .catch(() => {});
  }, [username]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const copyPortfolioLink = () => {
    const url = `${window.location.origin}/portfolio/${username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyEmail = () => {
    if (!user?.email) return;
    navigator.clipboard.writeText(user.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const refreshPinned = () => {
    if (!username) return;
    setRefreshingPinned(true);
    axios
      .get(`${API_URL}/pinned/${username}?refresh=true`)
      .then((res) => setPinnedRepos(res.data.pinned || []))
      .catch(() => {})
      .finally(() => setRefreshingPinned(false));
  };

  const isDark = theme === "dark";
  const topLanguages = Object.keys(languages).slice(0, 8);
  // Prefer the user's manually pinned repos (what they chose to showcase)
  // over pure star-count sorting. Falls back to the existing star-sort
  // behavior if they haven't pinned anything on GitHub.
  const topProjects = pinnedRepos.length > 0
    ? pinnedRepos.map((pinned) => {
        // Match against the full repo data so we still get the richer
        // description/language info already fetched via /api/repos
        const fullRepo = repos.find((r) => r.name === pinned.name);
        return fullRepo || pinned;
      })
    : [...repos].sort((a, b) => (b.stars || 0) - (a.stars || 0)).slice(0, 6);

  if (!user) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${
        isDark ? "bg-[#0B0C10]" : "bg-[#FAFAFB]"
      }`}>
        <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="mt-3 text-indigo-400 font-medium text-xs">Loading portfolio...</p>
      </div>
    );
  }

  const mutedText = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-20 relative overflow-hidden ${
      isDark ? "bg-[#0B0C10] text-slate-200" : "bg-[#FAFAFB] text-slate-700"
    }`}>
      {/* Subtle depth glow behind the hero — pure CSS gradient, no
          blur() filter, so it renders crisp and cheap */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at center, rgba(99,102,241,0.12), transparent 70%)"
            : "radial-gradient(ellipse at center, rgba(99,102,241,0.08), transparent 70%)",
        }}
      ></div>

      {/* Minimal top bar */}
      <header className="relative px-4 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            <span className="text-sm font-semibold text-indigo-500">DevPulse</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyPortfolioLink}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors duration-200"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-colors duration-200 ${
                isDark ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828 0l-.707-.707m12.02-12.02l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-2xl mx-auto px-5 mt-8">
        {/* ── Hero — editorial, no boxes ── */}
        <div className="flex items-start gap-5 mb-2">
          <div
            className="rounded-full flex-shrink-0"
            style={{
              boxShadow: isDark
                ? "0 12px 28px -8px rgba(99,102,241,0.35), 0 2px 8px -2px rgba(0,0,0,0.4)"
                : "0 12px 28px -8px rgba(99,102,241,0.25), 0 2px 8px -2px rgba(30,30,60,0.15)",
            }}
          >
            <img
              src={user.avatar}
              alt="avatar"
              className="w-16 h-16 rounded-full object-cover"
              style={{ border: isDark ? "2px solid rgba(255,255,255,0.08)" : "2px solid white" }}
            />
          </div>
          <div className="flex-1 pt-1">
            <h1 className="text-2xl font-semibold tracking-tight leading-tight inline-flex items-center gap-2">
              {user.name}
              <VerifiedBadge username={user.username} theme={theme} size="lg" />
            </h1>
            <p className={`text-sm mt-0.5 ${mutedText}`}>{user.bio || "Software Engineer"}</p>
          </div>
          <div className="flex-shrink-0 scale-[0.6] -m-6">
            <ScoreRing score={user.score || 0} theme={theme} />
          </div>
        </div>

        <div className={`flex flex-wrap gap-x-3 gap-y-1 text-xs mb-6 ${mutedText}`}>
          <span>{user.location || "Remote"}</span>
          <span>·</span>
          <a href={`https://github.com/${user.username}`} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">
            github.com/{user.username}
          </a>
          <span>·</span>
          <span>{stats?.commits || 0} commits</span>
          <span>·</span>
          <span>{stats?.repos || 0} repositories</span>
        </div>

        {/* ── About — flowing paragraph, not a boxed card ── */}
        <p className={`text-[15px] leading-relaxed mb-10 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          {generateAboutSummary(user, stats, topLanguages)}
        </p>

        {/* ── Selected work — 3D tilt cards ── */}
        {topProjects.length > 0 && (
          <div className="mb-10">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className={`text-xs font-semibold uppercase tracking-widest ${mutedText}`}>
                Selected Work
              </h2>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] ${mutedText}`}>
                  {pinnedRepos.length > 0 ? "Pinned on GitHub" : "Sorted by stars"}
                </span>
                <button
                  onClick={refreshPinned}
                  disabled={refreshingPinned}
                  className={`${mutedText} hover:text-indigo-500 transition-colors disabled:opacity-40`}
                  title="Refresh — fetch the latest from GitHub now"
                >
                  <svg className={`w-3 h-3 ${refreshingPinned ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ perspective: "1200px" }}>
              {topProjects.map((repo) => (
                <a key={repo.name} href={repo.url} target="_blank" rel="noreferrer" className="block no-underline text-inherit">
                  <TiltCard isDark={isDark}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-[15px]">{repo.name}</h3>
                      <span className="text-yellow-500 text-xs font-medium">★ {repo.stars || 0}</span>
                    </div>
                    <p className={`text-xs leading-relaxed mb-3 ${mutedText}`}>
                      {truncateAtWord(repo.description, 85) || "No description available"}
                    </p>
                    {repo.language && (
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${mutedText}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        {repo.language}
                      </span>
                    )}
                  </TiltCard>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Skills — plain text, not badges ── */}
        {topLanguages.length > 0 && (
          <div className="mb-10">
            <h2 className={`text-xs font-semibold uppercase tracking-widest mb-3 ${mutedText}`}>
              Skills
            </h2>
            <p className={`text-sm leading-loose ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              {topLanguages.join(", ")}
            </p>
          </div>
        )}

        {/* ── Contact — a real closing section, not a squeezed line ── */}
        <div
          className={`mt-4 -mx-5 px-8 py-10 rounded-2xl text-center ${
            isDark ? "bg-white/[0.03]" : "bg-slate-50"
          }`}
        >
          <h2 className="text-xl font-semibold tracking-tight mb-2">Let's work together</h2>
          <p className={`text-sm max-w-sm mx-auto mb-6 ${mutedText}`}>
            Open to new opportunities and interesting projects — reach out through any of these.
          </p>

          <div className="flex items-center justify-center gap-3">
            <a
              href={`https://github.com/${user.username}`}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold border transition-colors duration-200 ${
                isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>

            {user.email && (
              <button
                onClick={copyEmail}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold border transition-colors duration-200 ${
                  isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {copiedEmail ? "Email Copied!" : "Copy Email"}
              </button>
            )}

            <button
              onClick={copyPortfolioLink}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {copied ? "Copied!" : "Share Portfolio"}
            </button>
          </div>
        </div>

        {/* ── Closing bar ── */}
        <div className={`flex items-center justify-between mt-6 pt-5 border-t ${isDark ? "border-white/[0.07]" : "border-slate-200"}`}>
          <p className={`text-xs ${mutedText}`}>
            © {new Date().getFullYear()} {user.name || user.username} · Reputation score {user.score || 0}/100
          </p>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <span className="h-1 w-1 rounded-full bg-indigo-500"></span>
            <span>Powered by</span>
            <span className="text-indigo-500 font-semibold">DevPulse</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PortfolioPage;