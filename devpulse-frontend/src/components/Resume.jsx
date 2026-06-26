import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function Resume({ user, stats, languages, repos }) {
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

    const canvas = await html2canvas(resumeElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#f9f5f5",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${user?.username || "resume"}-Resume.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">

        {/* ── EDIT PANEL (never captured in PDF) ── */}
        <div className="bg-white rounded-xl shadow p-6 mb-6 border border-pink-200">
          <h2 className="text-xl font-bold text-pink-500 mb-4">
            Edit Your Resume
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Full Name</label>
              <input
                value={editableData.name}
                onChange={(e) =>
                  setEditableData({ ...editableData, name: e.target.value })
                }
                 className="border rounded-lg p-2 w-full text-black"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Email</label>
              <input
                value={editableData.email}
                onChange={(e) =>
                  setEditableData({ ...editableData, email: e.target.value })
                }
                className="border rounded-lg p-2 w-full text-black"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-500 mb-1 block">Professional Summary</label>
            <textarea
              value={editableData.bio}
              onChange={(e) =>
                setEditableData({ ...editableData, bio: e.target.value })
              }
              className="border rounded-lg p-2 w-full h-24 resize-none text-black"
              placeholder="Write a short professional summary..."
            />
          </div>

          {/* Education Form */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
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
                className="border rounded-lg p-2 text-black"
              />
              <input
                type="text"
                placeholder="Institute"
                value={educationForm.institute}
                onChange={(e) =>
                  setEducationForm({ ...educationForm, institute: e.target.value })
                }
                className="border rounded-lg p-2 text-black"
              />
              <input
                type="text"
                placeholder="Year (e.g. 2021-2025)"
                value={educationForm.year}
                onChange={(e) =>
                  setEducationForm({ ...educationForm, year: e.target.value })
                }
                className="border rounded-lg p-2 text-black"
              />
            </div>
            <button
              onClick={() => {
                if (educationForm.degree && educationForm.institute && educationForm.year) {
                  setEducation([...education, educationForm]);
                  setEducationForm({ degree: "", institute: "", year: "" });
                }
              }}
              className="mt-3 bg-pink-500 text-white px-5 py-2 rounded-lg hover:bg-pink-600"
            >
              + Add Education
            </button>
          </div>

          {/* Experience Form */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
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
                className="border rounded-lg p-2 text-black"
              />
              <input
                type="text"
                placeholder="Role"
                value={experienceForm.role}
                onChange={(e) =>
                  setExperienceForm({ ...experienceForm, role: e.target.value })
                }
                className="border rounded-lg p-2 text-black"
              />
              <input
                type="text"
                placeholder="Duration (e.g. 2023-2024)"
                value={experienceForm.duration}
                onChange={(e) =>
                  setExperienceForm({ ...experienceForm, duration: e.target.value })
                }
                className="border rounded-lg p-2 text-black"
              />
            </div>
            <button
              onClick={() => {
                if (experienceForm.company && experienceForm.role && experienceForm.duration) {
                  setExperience([...experience, experienceForm]);
                  setExperienceForm({ company: "", role: "", duration: "" });
                }
              }}
              className="mt-3 bg-pink-500 text-white px-5 py-2 rounded-lg hover:bg-pink-600"
            >
              + Add Experience
            </button>
          </div>

          {/* Extra Skills */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Add Extra Skills
            </label>
            <input
              type="text"
              value={skillInput}
              placeholder="Type skill and press Enter"
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && skillInput.trim() !== "") {
                  setExtraSkills([...extraSkills, skillInput.trim()]);
                  setSkillInput("");
                }
              }}
              className="border p-2 w-full rounded-lg text-black"
            />
          </div>
        </div>

        {/* Download Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={downloadPDF}
            className="bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 font-semibold text-lg"
          >
            ⬇ Download PDF
          </button>
        </div>

        {/* ── RESUME PREVIEW (this gets captured as PDF) ── */}
        <div
          id="resume-preview"
          className="bg-white shadow-xl rounded-xl p-10"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          {/* Header */}
          <div className="border-b-2 border-pink-500 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  {editableData.name || user?.name}
                </h1>
                <p className="text-pink-500 text-lg font-semibold mt-1">
                  Software Developer
                </p>
              </div>
              <div className="text-right">
                <span className="bg-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                  DevPulse Score: {user?.score}/100
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-gray-600 text-sm">
              {editableData.email && (
                <span>📧 {editableData.email}</span>
              )}
              <span>📍 {user?.location || "Pakistan"}</span>
              <span>🌐 github.com/{user?.username}</span>
              <span>👥 {user?.followers} followers</span>
            </div>
          </div>

          {/* Professional Summary */}
          {editableData.bio && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-pink-500 border-b border-gray-200 pb-2 mb-3">
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {editableData.bio}
              </p>
            </div>
          )}

          {/* GitHub Stats */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-pink-500 border-b border-gray-200 pb-2 mb-3">
              GitHub Statistics
            </h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-pink-500">{stats?.commits || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Commits</p>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-pink-500">{stats?.repos || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Repositories</p>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-pink-500">{stats?.stars || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Stars</p>
              </div>
              <div className="text-center bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-pink-500">{stats?.prs || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Pull Requests</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          {uniqueSkills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-pink-500 border-b border-gray-200 pb-2 mb-3">
                Technical Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {uniqueSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-pink-50 text-pink-700 border border-pink-200 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-pink-500 border-b border-gray-200 pb-2 mb-3">
                Education
              </h2>
              {education.map((edu, index) => (
                <div key={index} className="mb-3 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                    <p className="text-gray-600 text-sm">{edu.institute}</p>
                  </div>
                  <span className="text-gray-500 text-sm font-medium">{edu.year}</span>
                </div>
              ))}
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-pink-500 border-b border-gray-200 pb-2 mb-3">
                Experience
              </h2>
              {experience.map((exp, index) => (
                <div key={index} className="mb-3 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800">{exp.role}</h3>
                    <p className="text-gray-600 text-sm">{exp.company}</p>
                  </div>
                  <span className="text-gray-500 text-sm font-medium">{exp.duration}</span>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {topProjects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-pink-500 border-b border-gray-200 pb-2 mb-3">
                Projects
              </h2>
              {topProjects.map((repo) => (
                <div key={repo.name} className="mb-4 border-l-4 border-pink-500 pl-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 text-lg">{repo.name}</h3>
                    <span className="text-yellow-600 text-sm font-semibold">⭐ {repo.stars}</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    {repo.description || "No description available"}
                  </p>
                  <p className="text-blue-600 text-sm mt-1">{repo.url}</p>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4 mt-4 text-center">
            <p className="text-gray-400 text-xs">
              Generated by DevPulse — devpulse.xyz/{user?.username}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Resume;