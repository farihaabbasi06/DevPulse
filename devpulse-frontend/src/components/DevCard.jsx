import html2canvas from "html2canvas";
import { useRef } from "react";
function DevCard({ user, stats, languages, theme }) {
const cardRef = useRef(null);

const downloadCard = async () => {
  
 const canvas = await html2canvas(cardRef.current, {
  useCORS: true,
  allowTaint: true,
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
    card: "bg-gray-900 border-pink-500",
    accent: "text-pink-500",
    pill: "bg-pink-500",
    stat: "text-pink-400"
  },

  navy: {
    card: "bg-slate-900 border-blue-500",
    accent: "text-blue-500",
    pill: "bg-blue-500",
    stat: "text-blue-400"
  },

  purple: {
    card: "bg-gray-900 border-purple-500",
    accent: "text-purple-500",
    pill: "bg-purple-500",
    stat: "text-purple-400"
  }
};

const currentTheme = themes[theme];

 return (
  <>
     
    <div
  ref={cardRef}
  className={`p-6 rounded-xl w-full max-w-md border ${currentTheme.card}`}
>

      <img
        src={user?.avatar}
        alt="avatar"
        crossOrigin="anonymous"
       className={`text-center text-2xl font-bold mt-4 ${currentTheme.accent}`}
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
        <span className={`text-4xl font-bold ${currentTheme.accent}`}>
          {user?.score}
        </span>

        <p className="text-gray-400">
          Reputation Score
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">

 <div className="bg-black p-3 rounded-lg text-center">
  <p className={currentTheme.stat}>🔥 Commits</p>
  <p className="font-bold text-white text-2xl">{stats?.commits}</p>
</div>

<div className="bg-black p-3 rounded-lg text-center">
  <p className={currentTheme.stat}>📦 Repos</p>
  <p className="font-bold text-white text-2xl">{stats?.repos}</p>
</div>

<div className="bg-black p-3 rounded-lg text-center">
  <p className={currentTheme.stat}>🔁 PRs</p>
  <p className="font-bold text-white text-2xl">{stats?.prs}</p>
</div>

<div className="bg-black p-3 rounded-lg text-center">
  <p className={currentTheme.stat}>⭐ Stars</p>
  <p className="font-bold text-white text-2xl">{stats?.stars}</p>
</div>
    </div>
    <h3 className={`mt-6 mb-3 text-center font-bold ${currentTheme.stat}`}>
  Top Languages
</h3>
<div className="flex flex-wrap justify-center gap-2">

  {Object.keys(languages || {})
    .slice(0, 5)
    .map((lang) => (
      <span
        key={lang}
       className={`px-3 py-1 text-white rounded-full text-sm ${currentTheme.pill}`}
      >
        {lang}
      </span>
    ))}

</div>
<div className="mt-6 pt-4 border-t border-gray-700 text-center">
  <p className="text-sm text-gray-400">
    devpulse.xyz/{user?.username}
  </p>
</div>

</div>

 <button
  onClick={downloadCard}
  className="mt-4 w-full bg-pink-500 text-white py-2 rounded-lg"
>
  Download PNG
</button>

<button
  onClick={copyLink}
  className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg"
>
  Copy Link
</button>

    </>
    
  );
 
}

export default DevCard;