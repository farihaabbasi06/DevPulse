import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Intensity buckets — same 5-shade convention GitHub itself uses
function getIntensityClass(count, isDark) {
  if (count === 0) return isDark ? "bg-white/[0.04]" : "bg-slate-100";
  if (count <= 2) return isDark ? "bg-indigo-900/60" : "bg-indigo-200";
  if (count <= 5) return isDark ? "bg-indigo-700/70" : "bg-indigo-400";
  if (count <= 9) return isDark ? "bg-indigo-500" : "bg-indigo-500";
  return isDark ? "bg-indigo-400" : "bg-indigo-600";
}

// Groups a flat array of {date, count} into columns of weeks (7 days
// each, Sunday-start) so it can render as a grid exactly like GitHub's.
function groupIntoWeeks(days) {
  if (!days || days.length === 0) return [];
  const weeks = [];
  let currentWeek = [];

  days.forEach((day, index) => {
    const dow = new Date(day.date).getDay();
    if (index === 0) {
      // Pad the first week so it aligns to the correct day-of-week column
      for (let i = 0; i < dow; i++) currentWeek.push(null);
    }
    currentWeek.push(day);
    if (dow === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);
  return weeks;
}

function ContributionHeatmap({ username, theme }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    axios
      .get(`${API_URL}/heatmap/${username}`)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [username]);

  const isDark = theme === "dark";
  const mutedText = isDark ? "text-slate-400" : "text-slate-500";
  const cardClass = `p-5 rounded-xl border transition-colors duration-300 ${
    isDark ? "bg-[#12131A] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"
  }`;

  if (loading) {
    return (
      <div className={cardClass}>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className={`text-xs ${mutedText}`}>Loading contribution history...</span>
        </div>
      </div>
    );
  }

  if (!data || !data.days || data.days.length === 0) return null;

  const weeks = groupIntoWeeks(data.days);
  const monthLabels = [];
  let lastMonth = null;
  weeks.forEach((week, i) => {
    const firstRealDay = week.find((d) => d !== null);
    if (!firstRealDay) return;
    const month = new Date(firstRealDay.date).toLocaleString("en-US", { month: "short" });
    if (month !== lastMonth) {
      monthLabels.push({ index: i, label: month });
      lastMonth = month;
    }
  });

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-400">Contribution Activity</h3>
        <span className={`text-xs ${mutedText}`}>{data.totalContributions} contributions in the last year</span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-1 ml-6" style={{ gap: "3px" }}>
            {weeks.map((_, i) => {
              const label = monthLabels.find((m) => m.index === i);
              return (
                <div key={i} className={`text-[9px] ${mutedText}`} style={{ width: "11px" }}>
                  {label ? label.label : ""}
                </div>
              );
            })}
          </div>

          <div className="flex" style={{ gap: "3px" }}>
            {/* Day-of-week labels */}
            <div className="flex flex-col justify-between mr-1" style={{ height: "77px" }}>
              {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => (
                <span key={i} className={`text-[9px] leading-none ${mutedText}`}>{label}</span>
              ))}
            </div>

            {/* The grid itself */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col" style={{ gap: "3px" }}>
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const day = week[dayIndex];
                  if (!day) {
                    return <div key={dayIndex} style={{ width: "11px", height: "11px" }} />;
                  }
                  return (
                    <div
                      key={dayIndex}
                      title={`${day.count} contribution${day.count !== 1 ? "s" : ""} on ${new Date(day.date).toLocaleDateString()}`}
                      className={`rounded-[2px] ${getIntensityClass(day.count, isDark)}`}
                      style={{ width: "11px", height: "11px" }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className={`text-[9px] ${mutedText}`}>Less</span>
        {[0, 2, 5, 9, 12].map((count) => (
          <div key={count} className={`rounded-[2px] ${getIntensityClass(count, isDark)}`} style={{ width: "10px", height: "10px" }} />
        ))}
        <span className={`text-[9px] ${mutedText}`}>More</span>
      </div>
    </div>
  );
}

export default ContributionHeatmap;