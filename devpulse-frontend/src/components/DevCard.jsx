import html2canvas from "html2canvas";
import { useRef } from "react";

function DevCard({ user, stats, languages, theme, globalTheme }) {
  const cardRef = useRef(null);

  const downloadCard = async () => {
    const canvas = await html2canvas(cardRef.current, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: null // transparent capture
    });

    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `${user?.username}-devcard.png`;
    link.click();
  };

  const copyLink = () => {
    const url = `${window.location.origin}/profile/${user?.username}`;
    navigator.clipboard.writeText(url);
    alert("Link copied!");
  };

  const themes = {
    pink: {
      card: "bg-gradient-to-br from-[#1E0F1C] via-[#0E0610] to-[#0A030C] border-pink-500/40 text-white shadow-[0_10px_35px_-5px_rgba(236,72,153,0.2)]",
      accent: "text-pink-500",
      pill: "bg-gradient-to-r from-pink-500 to-rose-500",
      stat: "text-pink-400",
      box: "bg-pink-950/15 border border-pink-500/10",
      dot: "bg-pink-500"
    },
    navy: {
      card: "bg-gradient-to-br from-[#0B1528] via-[#050B16] to-[#02050E] border-blue-500/40 text-white shadow-[0_10px_35px_-5px_rgba(59,130,246,0.2)]",
      accent: "text-blue-500",
      pill: "bg-gradient-to-r from-blue-500 to-indigo-500",
      stat: "text-blue-400",
      box: "bg-blue-950/15 border border-blue-500/10",
      dot: "bg-blue-500"
    },
    purple: {
      card: "bg-gradient-to-br from-[#150D2A] via-[#090516] to-[#04020A] border-purple-500/40 text-white shadow-[0_10px_35px_-5px_rgba(168,85,247,0.2)]",
      accent: "text-purple-500",
      pill: "bg-gradient-to-r from-purple-500 to-fuchsia-600",
      stat: "text-purple-400",
      box: "bg-purple-950/15 border border-purple-500/10",
      dot: "bg-purple-500"
    }
  };

  const currentTheme = themes[theme] || themes.pink;

  return (
    <div className="flex flex-col items-center w-full max-w-sm px-4">
      {/* Dev Card Viewport */}
      <div
        ref={cardRef}
        className={`p-6 rounded-3xl w-full border relative overflow-hidden transition-all duration-300 ${currentTheme.card}`}
      >
        {/* Subtle Decorative Gradient Glows in Card Background */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-pink-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

        {/* Card Branding Tag */}
        <div className="flex justify-between items-center mb-4 text-[10px] tracking-widest font-black uppercase text-gray-500">
          <span>DevPulse Identity</span>
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.dot}`}></span>
            Active
          </span>
        </div>

        {/* Profile Details Container */}
        <div className="flex flex-col items-center">
          <img
            src={user?.avatar}
            alt="avatar"
            crossOrigin="anonymous"
            className="w-20 h-20 rounded-full object-cover border-2 border-white/10 shadow-md mb-3"
          />

          <h2 className="text-center text-xl font-black tracking-tight text-white mb-0.5">
            {user?.name}
          </h2>

          <p className={`text-center text-xs font-bold ${currentTheme.stat}`}>
            @{user?.username}
          </p>

          {user?.location && (
            <p className="text-center text-[11px] text-gray-400 mt-1 flex items-center gap-1 justify-center">
              <span>📍</span> {user.location}
            </p>
          )}
        </div>

        {/* Score Ring Display inside card */}
        <div className="text-center my-5 py-3 border-y border-white/5 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/5">
          <span className={`text-4xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent`}>
            {user?.score}
          </span>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-extrabold mt-0.5">
            Reputation Score
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className={`p-2.5 rounded-xl text-center ${currentTheme.box}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${currentTheme.stat}`}>🔥 Commits</p>
            <p className="font-extrabold text-white text-lg mt-0.5">{stats?.commits || 0}</p>
          </div>

          <div className={`p-2.5 rounded-xl text-center ${currentTheme.box}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${currentTheme.stat}`}>📦 Repos</p>
            <p className="font-extrabold text-white text-lg mt-0.5">{stats?.repos || 0}</p>
          </div>

          <div className={`p-2.5 rounded-xl text-center ${currentTheme.box}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${currentTheme.stat}`}>🔁 PRs</p>
            <p className="font-extrabold text-white text-lg mt-0.5">{stats?.prs || 0}</p>
          </div>

          <div className={`p-2.5 rounded-xl text-center ${currentTheme.box}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${currentTheme.stat}`}>⭐ Stars</p>
            <p className="font-extrabold text-white text-lg mt-0.5">{stats?.stars || 0}</p>
          </div>
        </div>

        {/* Top Languages Pills */}
        <h3 className={`mt-5 mb-2.5 text-center text-xs font-bold uppercase tracking-widest ${currentTheme.stat}`}>
          Top Languages
        </h3>
        <div className="flex flex-wrap justify-center gap-1.5">
          {Object.keys(languages || {}).length > 0 ? (
            Object.keys(languages || {})
              .slice(0, 4)
              .map((lang) => (
                <span
                  key={lang}
                  className={`px-2.5 py-0.5 text-white rounded-full text-[10px] font-bold shadow-sm ${currentTheme.pill}`}
                >
                  {lang}
                </span>
              ))
          ) : (
            <span className="text-[10px] text-gray-500">None detected</span>
          )}
        </div>

        {/* Card Footer URL */}
        <div className="mt-5 pt-3.5 border-t border-white/5 text-center">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            devpulse.xyz/{user?.username}
          </p>
        </div>
      </div>

      {/* Modern Compact Buttons Container */}
      <div className="flex gap-3 w-full mt-4">
        {/* Download Button */}
        <button
          onClick={downloadCard}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white shadow-md hover:scale-[1.02] active:scale-98 transition-all duration-300 ${
            globalTheme === "dark"
              ? "bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-500/10"
              : "bg-gradient-to-r from-pink-400 to-purple-500 shadow-pink-200"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PNG
        </button>

        {/* Copy Link Button */}
        <button
          onClick={copyLink}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-all duration-300 hover:scale-[1.02] active:scale-98 ${
            globalTheme === "dark"
              ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
              : "bg-white border-pink-200 text-slate-700 hover:bg-pink-50/50 shadow-sm"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy Link
        </button>
      </div>
    </div>
  );
}

export default DevCard;
