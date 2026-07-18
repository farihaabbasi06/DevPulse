import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function Resume({ user, stats, languages, repos, globalTheme }) {
  const skills = Object.keys(languages || {}).slice(0, 8);
  const topProjects = (repos || []).slice(0, 3);

  const [editableData, setEditableData] = useState({
    name: "",
    email: "",
    bio: "",
  });

  const [education, setEducation] = useState([]);
  const [educationForm, setEducationForm] = useState({
    degree: "",
    institute: "",
    year: "",
  });

  const [experience, setExperience] = useState([]);
  const [experienceForm, setExperienceForm] = useState({
    company: "",
    role: "",
    duration: "",
  });

  const [extraSkills, setExtraSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  
  // State to temporarily hide delete buttons during PDF export
  const [isPrinting, setIsPrinting] = useState(false);

  const allSkills = [...skills, ...extraSkills];
  const uniqueSkills = [...new Set(allSkills)];

  useEffect(() => {
    if (user) {
      setEditableData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const downloadPDF = async () => {
    const resumeElement = document.getElementById("resume-preview");
    if (!resumeElement) return;

    // Set printing state to true to hide edit controls in PDF
    setIsPrinting(true);

    // Wait a brief frame for the DOM to update and hide the delete elements
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(resumeElement, {
        scale: 2.5, // High resolution capture
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${user?.username || "resume"}-Resume.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      // Restore delete buttons
      setIsPrinting(false);
    }
  };

  const isDark = globalTheme === "dark";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12">
      {/* ── EDIT PANEL (Never captured in PDF) ── */}
      <div className={`p-6 rounded-3xl border shadow-xl transition-all duration-300 mb-8 backdrop-blur-md ${
        isDark
          ? "bg-[#12131C]/90 border-white/5 text-white"
          : "bg-white border-pink-100 text-slate-700 shadow-pink-100/20"
      }`}>
        <h2 className="text-xl font-black mb-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent uppercase tracking-wider">
          Edit Your Resume Data
        </h2>

        {/* Profile details edit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? "text-gray-400" : "text-slate-500"
            }`}>Full Name</label>
            <input
              value={editableData.name}
              onChange={(e) =>
                setEditableData({ ...editableData, name: e.target.value })
              }
              className={`w-full p-3 rounded-xl border text-sm font-semibold outline-none transition-all duration-300 ${
                isDark
                  ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  : "bg-slate-50 border-pink-100 text-slate-700 placeholder-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
              }`}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? "text-gray-400" : "text-slate-500"
            }`}>Email</label>
            <input
              value={editableData.email}
              onChange={(e) =>
                setEditableData({ ...editableData, email: e.target.value })
              }
              className={`w-full p-3 rounded-xl border text-sm font-semibold outline-none transition-all duration-300 ${
                isDark
                  ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  : "bg-slate-50 border-pink-100 text-slate-700 placeholder-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
              }`}
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
            isDark ? "text-gray-400" : "text-slate-500"
          }`}>Professional Summary</label>
          <textarea
            value={editableData.bio}
            onChange={(e) =>
              setEditableData({ ...editableData, bio: e.target.value })
            }
            className={`w-full p-3 rounded-xl border text-sm font-semibold outline-none h-24 resize-none transition-all duration-300 ${
              isDark
                ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                : "bg-slate-50 border-pink-100 text-slate-700 placeholder-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
            }`}
            placeholder="Write a short professional summary..."
          />
        </div>

        {/* Education Form */}
        <div className="mb-6 pb-5 border-b border-opacity-10 border-slate-500">
          <label className={`block text-sm font-extrabold uppercase tracking-wide mb-3 ${
            isDark ? "text-pink-400" : "text-pink-500"
          }`}>
            Add Education
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Degree"
              value={educationForm.degree}
              onChange={(e) =>
                setEducationForm({ ...educationForm, degree: e.target.value })
              }
              className={`p-3 rounded-xl border text-sm font-semibold outline-none transition-all duration-300 ${
                isDark
                  ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500"
                  : "bg-slate-50 border-pink-100 text-slate-700 placeholder-slate-400 focus:border-pink-400"
              }`}
            />
            <input
              type="text"
              placeholder="Institute"
              value={educationForm.institute}
              onChange={(e) =>
                setEducationForm({ ...educationForm, institute: e.target.value })
              }
              className={`p-3 rounded-xl border text-sm font-semibold outline-none transition-all duration-300 ${
                isDark
                  ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500"
                  : "bg-slate-50 border-pink-100 text-slate-700 placeholder-slate-400 focus:border-pink-400"
              }`}
            />
            <input
              type="text"
              placeholder="Year (e.g. 2021-2025)"
              value={educationForm.year}
              onChange={(e) =>
                setEducationForm({ ...educationForm, year: e.target.value })
              }
              className={`p-3 rounded-xl border text-sm font-semibold outline-none transition-all duration-300 ${
                isDark
                  ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500"
                  : "bg-slate-50 border-pink-100 text-slate-700 placeholder-slate-400 focus:border-pink-400"
              }`}
            />
          </div>
          <button
            onClick={() => {
              if (educationForm.degree && educationForm.institute && educationForm.year) {
                setEducation([...education, educationForm]);
                setEducationForm({ degree: "", institute: "", year: "" });
              }
            }}
            className={`mt-4 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:scale-[1.03] active:scale-97 transition-all duration-300 ${
              isDark
                ? "bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-500/10"
                : "bg-gradient-to-r from-pink-400 to-purple-500 shadow-pink-200"
            }`}
          >
            + Add Education
          </button>
        </div>

        {/* Experience Form */}
        <div className="mb-6 pb-5 border-b border-opacity-10 border-slate-500">
          <label className={`block text-sm font-extrabold uppercase tracking-wide mb-3 ${
            isDark ? "text-pink-400" : "text-pink-500"
          }`}>
            Add Experience
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Company"
              value={experienceForm.company}
              onChange={(e) =>
                setExperienceForm({ ...experienceForm, company: e.target.value })
              }
              className={`p-3 rounded-xl border text-sm font-semibold outline-none transition-all duration-300 ${
                isDark
                  ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500"
                  : "bg-slate-50 border-pink-100 text-slate-700 placeholder-slate-400 focus:border-pink-400"
              }`}
            />
            <input
              type="text"
              placeholder="Role"
              value={experienceForm.role}
              onChange={(e) =>
                setExperienceForm({ ...experienceForm, role: e.target.value })
              }
              className={`p-3 rounded-xl border text-sm font-semibold outline-none transition-all duration-300 ${
                isDark
                  ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500"
                  : "bg-slate-50 border-pink-100 text-slate-700 placeholder-slate-400 focus:border-pink-400"
              }`}
            />
            <input
              type="text"
              placeholder="Duration (e.g. 2023-2024)"
              value={experienceForm.duration}
              onChange={(e) =>
                setExperienceForm({ ...experienceForm, duration: e.target.value })
              }
              className={`p-3 rounded-xl border text-sm font-semibold outline-none transition-all duration-300 ${
                isDark
                  ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500"
                  : "bg-slate-50 border-pink-100 text-slate-700 placeholder-slate-400 focus:border-pink-400"
              }`}
            />
          </div>
          <button
            onClick={() => {
              if (experienceForm.company && experienceForm.role && experienceForm.duration) {
                setExperience([...experience, experienceForm]);
                setExperienceForm({ company: "", role: "", duration: "" });
              }
            }}
            className={`mt-4 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:scale-[1.03] active:scale-97 transition-all duration-300 ${
              isDark
                ? "bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-500/10"
                : "bg-gradient-to-r from-pink-400 to-purple-500 shadow-pink-200"
            }`}
          >
            + Add Experience
          </button>
        </div>

        {/* Extra Skills input */}
        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
            isDark ? "text-gray-400" : "text-slate-500"
          }`}>Add Extra Skills</label>
          <input
            type="text"
            value={skillInput}
            placeholder="Type extra skill (e.g. Docker) and press Enter"
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && skillInput.trim() !== "") {
                e.preventDefault();
                setExtraSkills([...extraSkills, skillInput.trim()]);
                setSkillInput("");
              }
            }}
            className={`w-full p-3 rounded-xl border text-sm font-semibold outline-none transition-all duration-300 ${
              isDark
                ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                : "bg-slate-50 border-pink-100 text-slate-700 placeholder-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
            }`}
          />
        </div>
      </div>

      {/* Download Action Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={downloadPDF}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-97 ${
            isDark
              ? "bg-gradient-to-r from-pink-500 to-purple-600 shadow-pink-500/10"
              : "bg-gradient-to-r from-pink-400 to-purple-500 shadow-pink-200"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF Resume
        </button>
      </div>

      {/* ── RESUME PREVIEW (Captured exactly as PDF) ── */}
      <div
        id="resume-preview"
        className="bg-white shadow-2xl rounded-2xl p-10 max-w-4xl mx-auto border border-gray-100 text-slate-800"
        style={{ fontFamily: "'Inter', sans-serif, Arial" }}
      >
        {/* Header */}
        <div className="border-b-2 border-pink-500 pb-5 mb-5 flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {editableData.name || user?.name || "Your Name"}
            </h1>
            <p className="text-pink-500 text-base font-bold mt-1 uppercase tracking-wider">
              Software Developer / Engineer
            </p>
            <div className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 text-slate-500 text-xs font-semibold">
              {editableData.email && (
                <span className="flex items-center gap-1">📧 {editableData.email}</span>
              )}
              <span className="flex items-center gap-1">📍 {user?.location || "Remote"}</span>
              <span className="flex items-center gap-1">🌐 github.com/{user?.username}</span>
              <span className="flex items-center gap-1">👥 {user?.followers || 0} followers</span>
            </div>
          </div>
          <div className="md:text-right">
            <span className="bg-pink-500 text-white px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-md">
              DevPulse Score: {user?.score || 0}/100
            </span>
          </div>
        </div>

        {/* Professional Summary */}
        {editableData.bio && (
          <div className="mb-5">
            <h2 className="text-sm font-black text-pink-500 border-b border-gray-100 pb-1.5 mb-2.5 uppercase tracking-widest">
              Professional Summary
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              {editableData.bio}
            </p>
          </div>
        )}

        {/* GitHub Stats */}
        <div className="mb-5">
          <h2 className="text-sm font-black text-pink-500 border-b border-gray-100 pb-1.5 mb-2.5 uppercase tracking-widest">
            GitHub Analytics Dashboard
          </h2>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center bg-slate-50 rounded-xl p-2.5 border border-slate-100 shadow-sm">
              <p className="text-xl font-extrabold text-pink-500">{stats?.commits || 0}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Commits</p>
            </div>
            <div className="text-center bg-slate-50 rounded-xl p-2.5 border border-slate-100 shadow-sm">
              <p className="text-xl font-extrabold text-pink-500">{stats?.repos || 0}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Repos</p>
            </div>
            <div className="text-center bg-slate-50 rounded-xl p-2.5 border border-slate-100 shadow-sm">
              <p className="text-xl font-extrabold text-pink-500">{stats?.stars || 0}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Stars</p>
            </div>
            <div className="text-center bg-slate-50 rounded-xl p-2.5 border border-slate-100 shadow-sm">
              <p className="text-xl font-extrabold text-pink-500">{stats?.prs || 0}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">PRs</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        {uniqueSkills.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-black text-pink-500 border-b border-gray-100 pb-1.5 mb-2.5 uppercase tracking-widest">
              Technical Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {uniqueSkills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-pink-50/50 text-pink-700 border border-pink-100 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"
                >
                  {skill}
                  {!isPrinting && (
                    <button
                      onClick={() => setExtraSkills(extraSkills.filter((s) => s !== skill))}
                      className="text-red-400 hover:text-red-600 font-black text-sm leading-none focus:outline-none transition-colors"
                      title="Remove skill"
                    >
                      &times;
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-black text-pink-500 border-b border-gray-100 pb-1.5 mb-2.5 uppercase tracking-widest">
              Education
            </h2>
            <div className="space-y-3.5">
              {education.map((edu, index) => (
                <div key={index} className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">{edu.degree}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{edu.institute}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-bold">{edu.year}</span>
                    {!isPrinting && (
                      <button
                        onClick={() => setEducation(education.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700 font-black text-lg focus:outline-none leading-none"
                        title="Remove"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-black text-pink-500 border-b border-gray-100 pb-1.5 mb-2.5 uppercase tracking-widest">
              Experience
            </h2>
            <div className="space-y-3.5">
              {experience.map((exp, index) => (
                <div key={index} className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">{exp.role}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{exp.company}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-bold">{exp.duration}</span>
                    {!isPrinting && (
                      <button
                        onClick={() => setExperience(experience.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700 font-black text-lg focus:outline-none leading-none"
                        title="Remove"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {topProjects.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-black text-pink-500 border-b border-gray-100 pb-1.5 mb-2.5 uppercase tracking-widest">
              Key Projects
            </h2>
            <div className="space-y-4">
              {topProjects.map((repo) => (
                <div key={repo.name} className="border-l-2 border-pink-500 pl-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-slate-800 text-sm">{repo.name}</h3>
                    <span className="text-yellow-600 text-xs font-bold">⭐ {repo.stars}</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    {repo.description || "No description available"}
                  </p>
                  <p className="text-blue-500 text-[10px] font-semibold mt-0.5 break-all">{repo.url}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-100 pt-3.5 mt-5 text-center">
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
            Generated via DevPulse — devpulse.xyz/{user?.username}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Resume;
