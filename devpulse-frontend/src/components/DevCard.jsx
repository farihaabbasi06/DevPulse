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
    indigo: {
      card: "bg-gradient-to-br from-[#140F2E] via-[#0A0716] to-[#040309] border-indigo-500/40 text-white shadow-[0_10px_35px_-5px_rgba(99,102,241,0.2)]",
      accent: "text-indigo-500",
      pill: "bg-gradient-to-r from-indigo-500 to-violet-500",
      stat: "text-indigo-400",
      box: "bg-indigo-950/15 border border-indigo-500/10",
      dot: "bg-indigo-500",
      ring: "ring-indigo-400/30",
      iconBg: "bg-indigo-500/10"
    },
    navy: {
      card: "bg-gradient-to-br from-[#0B1528] via-[#050B16] to-[#02050E] border-blue-500/40 text-white shadow-[0_10px_35px_-5px_rgba(59,130,246,0.2)]",
      accent: "text-blue-500",
      pill: "bg-gradient-to-r from-blue-500 to-indigo-500",
      stat: "text-blue-400",
      box: "bg-blue-950/15 border border-blue-500/10",
      dot: "bg-blue-500",
      ring: "ring-blue-400/30",
      iconBg: "bg-blue-500/10"
    },
    purple: {
      card: "bg-gradient-to-br from-[#150D2A] via-[#090516] to-[#04020A] border-purple-500/40 text-white shadow-[0_10px_35px_-5px_rgba(168,85,247,0.2)]",
      accent: "text-purple-500",
      pill: "bg-gradient-to-r from-purple-500 to-fuchsia-600",
      stat: "text-purple-400",
      box: "bg-purple-950/15 border border-purple-500/10",
      dot: "bg-purple-500",
      ring: "ring-purple-400/30",
      iconBg: "bg-purple-500/10"
    }
  };

  const currentTheme = themes[theme] || themes.indigo;

  const statIcons = {
    Commits: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
        <path d="M12 2c-1.5 3-4 4.5-4 8a4 4 0 108 0c0-1-.3-1.8-.8-2.6.2 1-.1 1.9-.7 2.4-.2-2-1.5-3-1.5-3s-.3 1.2-1 2c-.5.6-.8 1.3-.8 2.2a2.8 2.8 0 105.6 0c0-4-3.8-5.5-4.8-9z" />
      </svg>
    ),
    Repos: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" />
      </svg>
    ),
    PRs: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v12M18 9v12M6 21a3 3 0 100-6 3 3 0 000 6zM18 9a3 3 0 100-6 3 3 0 000 6zM18 9c0 6-6 6-12 6" />
      </svg>
    ),
    Stars: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
        <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 6.9L12 17.3 5.8 20.8l1.6-6.9L2 9.2l7.1-.6L12 2z" />
      </svg>
    ),
  };

  const statItems = [
    { label: "Commits", value: stats?.commits || 0 },
    { label: "Repos", value: stats?.repos || 0 },
    { label: "PRs", value: stats?.prs || 0 },
    { label: "Stars", value: stats?.stars || 0 },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-xs px-4">
      {/* Dev Card Viewport */}
      <div
        ref={cardRef}
        className={`p-5 rounded-2xl w-full border relative overflow-hidden transition-all duration-300 ${currentTheme.card}`}
      >
        {/* Subtle Decorative Glow — radial-gradient instead of blur().
            html2canvas (used for PNG export) doesn't support CSS filter:
            blur() reliably, so a blurred div exports as a hard-edged
            circle. A radial-gradient fades natively and exports clean. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 88% 4%, rgba(99,102,241,0.16), transparent 32%), radial-gradient(circle at 4% 100%, rgba(168,85,247,0.14), transparent 32%)"
          }}
        ></div>

        {/* Card Branding Tag */}
        <div className="relative flex justify-between items-center mb-4 text-[9px] tracking-widest font-semibold uppercase text-gray-500">
          <span>DevPulse Identity</span>
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.dot} shadow-[0_0_6px_currentColor]`}></span>
            Active
          </span>
        </div>

        {/* Profile Details Container */}
        <div className="relative flex flex-col items-center">
          <div className={`p-[2px] rounded-full ${currentTheme.box} ring-2 ${currentTheme.ring} mb-2.5`}>
            <img
              src={user?.avatar}
              alt="avatar"
              crossOrigin="anonymous"
              className="w-14 h-14 rounded-full object-cover border-2 border-white/10"
            />
          </div>

          <h2 className="text-center text-base font-semibold tracking-tight text-white mb-0.5 leading-tight">
            {user?.name}
          </h2>

          <p className={`text-center text-[11px] font-medium ${currentTheme.stat}`}>
            @{user?.username}
          </p>

          {user?.location && (
            <p className="text-center text-[10px] text-gray-400 mt-1 flex items-center gap-1 justify-center">
              <span>📍</span> {user.location}
            </p>
          )}
        </div>

        {/* Score Ring Display inside card */}
        <div className={`relative text-center mt-4 mb-3 py-3 flex flex-col items-center justify-center bg-white/[0.04] rounded-xl border ${currentTheme.box} overflow-hidden`}>
          <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent`}></div>
          <span className="text-2xl font-semibold text-white leading-none">
            {user?.score}
            <span className="text-xs font-medium text-gray-500">/100</span>
          </span>
          <p className={`text-[9px] uppercase tracking-[0.15em] font-semibold mt-1 ${currentTheme.stat}`}>
            Reputation Score
          </p>
        </div>

        {/* Stats Grid */}
        <div className="relative grid grid-cols-2 gap-2">
          {statItems.map(({ label, value }) => (
            <div key={label} className={`p-2.5 rounded-lg text-center ${currentTheme.box}`}>
              <div
                className={`w-5 h-5 rounded-full ${currentTheme.iconBg} ${currentTheme.stat} flex items-center justify-center mb-1 mx-auto`}
              >
                {statIcons[label]}
              </div>
              <p className={`text-[9px] font-semibold uppercase tracking-wider ${currentTheme.stat}`}>{label}</p>
              <p className="font-semibold text-white text-base mt-0.5 leading-none">{value}</p>
            </div>
          ))}
        </div>

        {/* Top Languages — contained block, extra padding + overflow-hidden
            so pills never visually poke past the box's rounded corners */}
        <div className={`relative mt-3 px-3 pt-3 pb-4 rounded-xl border overflow-hidden ${currentTheme.box}`}>
          <h3 className={`mb-2.5 text-center text-[10px] font-semibold uppercase tracking-widest ${currentTheme.stat}`}>
            Top Languages
          </h3>
          <div className="flex flex-wrap justify-center gap-1.5">
            {Object.keys(languages || {}).length > 0 ? (
              Object.keys(languages || {})
                .slice(0, 4)
                .map((lang) => (
                  <span
                    key={lang}
                    className={`inline-block h-6 px-2.5 text-white rounded-full text-[9.5px] font-semibold shadow-sm overflow-hidden whitespace-nowrap text-center align-middle ${currentTheme.pill}`}
                    style={{ lineHeight: "24px", paddingTop: 0, paddingBottom: 0 }}
                  >
                    <span style={{ display: "inline-block", transform: "translateY(-1px)" }}>{lang}</span>
                  </span>
                ))
            ) : (
              <span className="text-[10px] text-gray-500">None detected</span>
            )}
          </div>
        </div>

        {/* Card Footer URL */}
        <div className="relative mt-4 pt-3 border-t border-white/5 text-center">
          <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest">
            devpulse.xyz/{user?.username}
          </p>
        </div>
      </div>

      {/* Buttons Container */}
      <div className="flex gap-2.5 w-full mt-4">
        {/* Download Button */}
        <button
          onClick={downloadCard}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PNG
        </button>

        {/* Copy Link Button */}
        <button
          onClick={copyLink}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border transition-colors duration-200 ${
            globalTheme === "dark"
              ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
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