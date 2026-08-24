
import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ── Skill categorization ──────────────────────────────────────────
const FRAMEWORK_TOOL_LIST = [
  "React", "React Native", "Next.js", "Vue", "Angular", "Node.js", "Express",
  "Flutter", "Django", "Flask", "Spring", "Laravel", "Blade", "TensorFlow",
  "PyTorch", "MongoDB", "Firebase", "Docker", "Kubernetes", "Git", "GraphQL",
  "Redux", "Tailwind", "Bootstrap", "jQuery", "Webpack", "Jest",
];

function categorizeSkills(skillList) {
  const languages = [];
  const frameworksTools = [];
  skillList.forEach((skill) => {
    const isFrameworkTool = FRAMEWORK_TOOL_LIST.some((fw) => fw.toLowerCase() === skill.toLowerCase());
    if (isFrameworkTool) frameworksTools.push(skill);
    else languages.push(skill);
  });
  return { languages, frameworksTools };
}

function generateProjectBullets(repo) {
  const bullets = [];
  const lang = repo.language ? repo.language : null;
  const desc = (repo.description || "").trim();

  if (desc) {
    const cleanDesc = desc.charAt(0).toUpperCase() + desc.slice(1).replace(/\.$/, "");
    bullets.push(
      lang
        ? `Developed ${repo.name}, ${cleanDesc.charAt(0).toLowerCase()}${cleanDesc.slice(1)}, using ${lang}`
        : `Developed ${repo.name}: ${cleanDesc}`
    );
  } else {
    bullets.push(lang ? `Built ${repo.name}, a ${lang} project` : `Built ${repo.name}`);
  }

  const stars = repo.stars || 0;
  if (stars > 0) bullets.push(`Earned ${stars} GitHub star${stars > 1 ? "s" : ""}, reflecting community interest and code quality`);
  if (repo.url) bullets.push(`Open-sourced the project — full source available on GitHub`);
  return bullets;
}

function generateAutoSummary(user, stats) {
  const parts = ["Software developer"];
  if (stats?.repos) parts.push(`with ${stats.repos} public repositories`);
  if (stats?.commits) parts.push(`and ${stats.commits}+ commits`);
  return `${parts.join(" ")}. Experienced in building and shipping full-stack applications, with a track record of open-source contribution and hands-on engineering across multiple languages and frameworks.`;
}

// ── Job description matcher ─────────────────────────────────────────
// Broad list of tech keywords a job posting might mention — deliberately
// wider than FRAMEWORK_TOOL_LIST since job postings mention cloud/tools/
// methodologies that aren't "skills" in the GitHub-language sense.
const JOB_KEYWORD_LIST = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust",
  "Ruby", "PHP", "Swift", "Kotlin", "Dart", "HTML", "CSS", "SQL",
  "React", "React Native", "Next.js", "Vue", "Angular", "Node.js", "Express",
  "Flutter", "Django", "Flask", "Spring", "Laravel", "TensorFlow", "PyTorch",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase", "Docker", "Kubernetes",
  "Git", "GraphQL", "REST", "Redux", "Tailwind", "Bootstrap", "jQuery",
  "Webpack", "Jest", "AWS", "Azure", "GCP", "CI/CD", "Jenkins", "Terraform",
  "Agile", "Scrum", "Linux", "Kafka", "Microservices",
];

// Extracts which known tech keywords appear in a block of free text (a job
// posting). Word-boundary, case-insensitive match so "Go" doesn't match
// inside "Google" etc.
function extractKeywords(text) {
  if (!text) return [];
  const found = [];
  JOB_KEYWORD_LIST.forEach((keyword) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, "i");
    if (pattern.test(text)) found.push(keyword);
  });
  return found;
}

function getInitials(name) {
  if (!name) return "??";
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("");
}


// ── Editable primitive ─────────────────────────────────────────────
// Uncontrolled contentEditable text — renders the initial value once,
// then the browser owns it, so edits survive unrelated re-renders.
function Editable({ as: Tag = "span", initialValue, className = "", isPrinting, placeholder = "" }) {
  return (
    <Tag
      contentEditable={!isPrinting}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={`${className} outline-none rounded px-0.5 -mx-0.5 ${
        !isPrinting ? "hover:bg-indigo-50 focus:bg-indigo-50 focus:ring-1 focus:ring-indigo-200 cursor-text" : ""
      } empty:before:content-[attr(data-placeholder)] empty:before:text-slate-300`}
    >
      {initialValue}
    </Tag>
  );
}

function Resume({ user, stats, languages, repos, globalTheme }) {
  const skills = Object.keys(languages || {}).slice(0, 10);
  const topProjects = (repos || []).slice(0, 3);
  const { languages: langSkills, frameworksTools } = categorizeSkills(skills);

  const [template, setTemplate] = useState("modern"); // "modern" | "ats"

  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [extraSkills, setExtraSkills] = useState([]);

  const [openForm, setOpenForm] = useState(null);
  const [educationForm, setEducationForm] = useState({ degree: "", institute: "", year: "" });
  const [experienceForm, setExperienceForm] = useState({ company: "", role: "", duration: "" });
  const [certForm, setCertForm] = useState({ name: "", issuer: "", year: "" });
  const [skillInput, setSkillInput] = useState("");

  const [isPrinting, setIsPrinting] = useState(false);

  const { languages: extraLangs, frameworksTools: extraFwTools } = categorizeSkills(extraSkills);
  const finalLanguages = [...new Set([...langSkills, ...extraLangs])];
  const finalFrameworksTools = [...new Set([...frameworksTools, ...extraFwTools])];

  // ── Job description matcher ──
  const [jobDescription, setJobDescription] = useState("");
  const [showMatcher, setShowMatcher] = useState(false);
  const [matchResults, setMatchResults] = useState(null); // { matched: [], missing: [], score: 0 }

  const runMatch = () => {
    const jobKeywords = extractKeywords(jobDescription);
    if (jobKeywords.length === 0) {
      setMatchResults({ matched: [], missing: [], score: 0, empty: true });
      return;
    }
    const userSkillsLower = new Set(
      [...finalLanguages, ...finalFrameworksTools].map((s) => s.toLowerCase())
    );
    const matched = jobKeywords.filter((k) => userSkillsLower.has(k.toLowerCase()));
    const missing = jobKeywords.filter((k) => !userSkillsLower.has(k.toLowerCase()));
    const score = Math.round((matched.length / jobKeywords.length) * 100);
    setMatchResults({ matched, missing, score, empty: false });
  };

  const clearMatch = () => {
    setMatchResults(null);
    setJobDescription("");
  };

  const matchedLower = matchResults ? matchResults.matched.map((m) => m.toLowerCase()) : [];

  // Reordered skill lists — matched skills float to the top when a job's been analyzed
  const orderedLanguages = matchResults
    ? [...finalLanguages].sort((a, b) => matchedLower.includes(b.toLowerCase()) - matchedLower.includes(a.toLowerCase()))
    : finalLanguages;
  const orderedFrameworksTools = matchResults
    ? [...finalFrameworksTools].sort((a, b) => matchedLower.includes(b.toLowerCase()) - matchedLower.includes(a.toLowerCase()))
    : finalFrameworksTools;

  // Reordered projects — ones whose language/description touch a matched
  // skill move up, so the most job-relevant project leads the resume
  const scoreProject = (repo) => {
    if (!matchResults) return 0;
    const haystack = `${repo.language || ""} ${repo.description || ""}`.toLowerCase();
    return matchedLower.filter((m) => haystack.includes(m)).length;
  };
  const orderedProjects = matchResults
    ? [...topProjects].sort((a, b) => scoreProject(b) - scoreProject(a))
    : topProjects;

  const displayName = user?.name || "Your Name";
  const summarySeed = generateAutoSummary(user, stats);

  const statCards = [
    { label: "Commits", val: stats?.commits },
    { label: "Repos", val: stats?.repos },
    { label: "PRs", val: stats?.prs },
    { label: "Stars", val: stats?.stars },
  ];

  const downloadPDF = async () => {
    const resumeElement = document.getElementById("resume-preview");
    if (!resumeElement) return;
    setIsPrinting(true);
    await new Promise((resolve) => setTimeout(resolve, 100));
    try {
      const canvas = await html2canvas(resumeElement, { scale: 2.5, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${user?.username || "resume"}-Resume.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsPrinting(false);
    }
  };

  const isDark = globalTheme === "dark";
  const miniInputClass = isDark
    ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-indigo-500"
    : "bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-indigo-400";

  const AddTrigger = ({ label, formKey, dark }) =>
    !isPrinting && (
      <button
        onClick={() => setOpenForm(openForm === formKey ? null : formKey)}
        className={`text-[10px] font-bold uppercase tracking-wider ml-2 ${dark ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-500 hover:text-indigo-600"}`}
      >
        {openForm === formKey ? "✕ close" : `+ add ${label}`}
      </button>
    );

  // ══════════════════════════════════════════════════════════════
  // Shared mini "add" forms (rendered inline near whichever section
  // triggered them — same data feeds both templates)
  // ══════════════════════════════════════════════════════════════
  const SkillForm = ({ dark }) =>
    openForm === "skill" && (
      <div className="flex gap-1.5 mb-3">
        <input
          type="text"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && skillInput.trim()) {
              setExtraSkills([...extraSkills, skillInput.trim()]);
              setSkillInput("");
            }
          }}
          placeholder="Type skill, press Enter"
          className={`flex-1 min-w-0 px-2 py-1.5 rounded text-[11px] outline-none border ${
            dark ? "bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-400" : "bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-indigo-400"
          }`}
        />
      </div>
    );

  const EducationForm = ({ dark }) =>
    openForm === "education" && (
      <div className="space-y-1.5 mb-3">
        {["degree", "institute", "year"].map((f) => (
          <input key={f} type="text" placeholder={f[0].toUpperCase() + f.slice(1)}
            value={educationForm[f]}
            onChange={(e) => setEducationForm({ ...educationForm, [f]: e.target.value })}
            className={`w-full px-2 py-1.5 rounded text-[11px] outline-none border ${
              dark ? "bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-400" : "bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-indigo-400"
            }`} />
        ))}
        <button
          onClick={() => {
            if (educationForm.degree && educationForm.institute) {
              setEducation([...education, educationForm]);
              setEducationForm({ degree: "", institute: "", year: "" });
              setOpenForm(null);
            }
          }}
          className="w-full text-[10px] font-bold py-1.5 rounded bg-indigo-500 hover:bg-indigo-400 text-white transition-colors"
        >
          Add
        </button>
      </div>
    );

  const CertForm = ({ dark }) =>
    openForm === "certification" && (
      <div className="space-y-1.5 mb-3">
        {["name", "issuer", "year"].map((f) => (
          <input key={f} type="text" placeholder={f[0].toUpperCase() + f.slice(1)}
            value={certForm[f]}
            onChange={(e) => setCertForm({ ...certForm, [f]: e.target.value })}
            className={`w-full px-2 py-1.5 rounded text-[11px] outline-none border ${
              dark ? "bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-400" : "bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-indigo-400"
            }`} />
        ))}
        <button
          onClick={() => {
            if (certForm.name && certForm.issuer) {
              setCertifications([...certifications, certForm]);
              setCertForm({ name: "", issuer: "", year: "" });
              setOpenForm(null);
            }
          }}
          className="w-full text-[10px] font-bold py-1.5 rounded bg-indigo-500 hover:bg-indigo-400 text-white transition-colors"
        >
          Add
        </button>
      </div>
    );

  const ExperienceForm = ({ dark }) =>
    openForm === "experience" && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <input type="text" placeholder="Company" value={experienceForm.company}
          onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
          className={`px-2.5 py-2 rounded border text-xs outline-none ${dark ? miniInputClass : "bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-indigo-400"}`} />
        <input type="text" placeholder="Role" value={experienceForm.role}
          onChange={(e) => setExperienceForm({ ...experienceForm, role: e.target.value })}
          className={`px-2.5 py-2 rounded border text-xs outline-none ${dark ? miniInputClass : "bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-indigo-400"}`} />
        <div className="flex gap-2">
          <input type="text" placeholder="Duration" value={experienceForm.duration}
            onChange={(e) => setExperienceForm({ ...experienceForm, duration: e.target.value })}
            className={`flex-1 min-w-0 px-2.5 py-2 rounded border text-xs outline-none ${dark ? miniInputClass : "bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-indigo-400"}`} />
          <button
            onClick={() => {
              if (experienceForm.company && experienceForm.role) {
                setExperience([...experience, experienceForm]);
                setExperienceForm({ company: "", role: "", duration: "" });
                setOpenForm(null);
              }
            }}
            className="px-3 rounded bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12">
      {/* Hint bar + template toggle — outside the printed resume */}
      <div className={`mb-5 px-4 py-3 rounded-xl text-xs font-semibold flex flex-wrap items-center justify-between gap-3 ${
        isDark ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
      }`}>
        <span className="flex items-center gap-2">✏️ Click any text on the resume to edit it directly.</span>
        <div className={`flex rounded-lg overflow-hidden border ${isDark ? "border-indigo-500/30" : "border-indigo-200"}`}>
          <button
            onClick={() => setTemplate("modern")}
            className={`px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
              template === "modern" ? "bg-indigo-500 text-white" : isDark ? "bg-transparent text-indigo-300" : "bg-white text-indigo-500"
            }`}
          >
            Modern
          </button>
          <button
            onClick={() => setTemplate("ats")}
            className={`px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
              template === "ats" ? "bg-indigo-500 text-white" : isDark ? "bg-transparent text-indigo-300" : "bg-white text-indigo-500"
            }`}
          >
            ATS-Safe
          </button>
        </div>
      </div>

      {template === "ats" && (
        <p className={`mb-4 text-[11px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Plain single-column layout, black on white — built to parse cleanly through applicant tracking systems (ATS). This is the version most people send to HR.
        </p>
      )}

      {/* ── Job Description Matcher — outside the printed resume ── */}
      <div className={`mb-6 p-4 rounded-xl border transition-colors duration-300 ${
        isDark ? "bg-[#12131A] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
            Match this resume to a job
          </h3>
          {!showMatcher && (
            <button
              onClick={() => setShowMatcher(true)}
              className="text-xs font-medium text-indigo-500 hover:text-indigo-600"
            >
              + Paste a job description
            </button>
          )}
          {showMatcher && !matchResults && (
            <button
              onClick={() => setShowMatcher(false)}
              className="text-xs font-medium text-slate-400 hover:text-slate-500"
            >
              ✕ close
            </button>
          )}
        </div>

        {!showMatcher && !matchResults && (
          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Paste the full job posting (requirements and responsibilities, not just the title) and this resume will highlight your matching skills and reorder itself to lead with them.
          </p>
        )}

        {showMatcher && !matchResults && (
          <div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job posting here — including the requirements or qualifications section. A job title alone (e.g. 'Software Engineer') won't have enough detail to match against."
              className={`w-full h-28 p-3 rounded-lg border text-xs outline-none resize-none ${
                isDark
                  ? "bg-white/[0.03] border-white/10 text-white placeholder-slate-500 focus:border-indigo-500"
                  : "bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400 focus:border-indigo-400"
              }`}
            />
            <button
              onClick={runMatch}
              disabled={jobDescription.trim().length < 40}
              className="mt-2.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none"
            >
              Analyze match
            </button>
          </div>
        )}

        {matchResults && matchResults.empty && (
          <div>
            <p className={`text-xs mb-1 font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Couldn't find any specific technologies in that text.
            </p>
            <p className={`text-xs mb-2.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              This usually happens when only a job title is pasted (e.g. "Backend Developer") instead of the full posting. Go back to the job listing and paste the requirements or qualifications section too — that's where specific tools and languages are usually named.
            </p>
            <button onClick={clearMatch} className="text-xs font-medium text-indigo-500 hover:text-indigo-600">
              Try again
            </button>
          </div>
        )}

        {matchResults && !matchResults.empty && (
          <div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-semibold text-indigo-500">{matchResults.score}%</span>
              <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                match — resume reordered to lead with your matching skills
              </span>
            </div>

            {matchResults.matched.length > 0 && (
              <div className="mb-2.5">
                <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Matched
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matchResults.matched.map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {matchResults.missing.length > 0 && (
              <div className="mb-3">
                <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Not found on your profile
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matchResults.missing.map((skill, i) => (
                    <span key={i} className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      isDark ? "bg-white/5 text-slate-400 border-white/10" : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button onClick={clearMatch} className="text-xs font-medium text-indigo-500 hover:text-indigo-600">
              Clear and try another job
            </button>
          </div>
        )}
      </div>

      {/* Download Button */}
      <div className="flex justify-end mb-6">
        <button onClick={downloadPDF}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-97 ${
            isDark ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-500/10" : "bg-gradient-to-r from-indigo-400 to-purple-500 shadow-indigo-200"
          }`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF Resume
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TEMPLATE: MODERN (two-column, sidebar)
          ══════════════════════════════════════════════════════════ */}
      {template === "modern" && (
        <div
          id="resume-preview"
          className="bg-white shadow-2xl rounded-lg overflow-hidden max-w-4xl mx-auto border border-gray-200 flex flex-col md:flex-row"
          style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
        >
          {/* SIDEBAR */}
          <div className="w-full md:w-[34%] bg-slate-800 text-white p-7">
            <div className="w-20 h-20 rounded-full bg-slate-700 border-2 border-indigo-400 flex items-center justify-center mb-5 mx-auto md:mx-0">
              <span className="text-2xl font-bold text-indigo-300 tracking-wide">{getInitials(displayName)}</span>
            </div>

            <div className="mb-7">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 border-b border-slate-600 pb-2 mb-3">Contact</h3>
              <ul className="space-y-2 text-xs text-slate-300 font-medium">
                <li className="flex items-start gap-2"><span>✉</span><Editable initialValue="your@email.com" isPrinting={isPrinting} className="break-all" /></li>
                <li className="flex items-start gap-2"><span>📍</span><Editable initialValue={user?.location || "Remote"} isPrinting={isPrinting} /></li>
                <li className="flex items-start gap-2"><span>⌥</span><span className="break-all">github.com/{user?.username}</span></li>
                <li className="flex items-start gap-2"><span>👥</span><span>{user?.followers || 0} followers</span></li>
              </ul>
            </div>

            <div className="mb-7">
              <div className="bg-slate-700/60 border border-slate-600 rounded-lg px-4 py-3 text-center">
                <p className="text-2xl font-extrabold text-indigo-300">{user?.score || 0}<span className="text-xs text-slate-400">/100</span></p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">DevPulse Score</p>
              </div>
            </div>

            <div className="mb-7">
              <div className="flex items-center flex-wrap">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 border-b border-slate-600 pb-2 mb-3 flex-1">Skills</h3>
                <AddTrigger label="skill" formKey="skill" dark />
              </div>
              <SkillForm dark />
              {orderedLanguages.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-1.5">Languages</p>
                  <div className="flex flex-wrap gap-1.5">
                    {orderedLanguages.map((skill, i) => (
                      <span key={i} className="bg-slate-700 text-slate-200 px-2 py-1 rounded text-[10px] font-semibold">
                        <Editable initialValue={skill} isPrinting={isPrinting} />
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {orderedFrameworksTools.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-1.5">Frameworks &amp; Tools</p>
                  <div className="flex flex-wrap gap-1.5">
                    {orderedFrameworksTools.map((skill, i) => (
                      <span key={i} className="bg-slate-700 text-slate-200 px-2 py-1 rounded text-[10px] font-semibold">
                        <Editable initialValue={skill} isPrinting={isPrinting} />
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-7">
              <div className="flex items-center flex-wrap">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 border-b border-slate-600 pb-2 mb-3 flex-1">Education</h3>
                <AddTrigger label="education" formKey="education" dark />
              </div>
              <EducationForm dark />
              <div className="space-y-3">
                {education.map((edu, index) => (
                  <div key={index} className="group relative">
                    <p className="text-xs font-bold text-white"><Editable initialValue={edu.degree} isPrinting={isPrinting} /></p>
                    <p className="text-[11px] text-slate-400"><Editable initialValue={edu.institute} isPrinting={isPrinting} /></p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5"><Editable initialValue={edu.year} isPrinting={isPrinting} /></p>
                    {!isPrinting && (
                      <button onClick={() => setEducation(education.filter((_, i) => i !== index))}
                        className="absolute top-0 right-0 text-red-400 opacity-0 group-hover:opacity-100 text-xs font-black transition-opacity">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center flex-wrap">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 border-b border-slate-600 pb-2 mb-3 flex-1">Certifications</h3>
                <AddTrigger label="cert" formKey="certification" dark />
              </div>
              <CertForm dark />
              <div className="space-y-3">
                {certifications.map((cert, index) => (
                  <div key={index} className="group relative">
                    <p className="text-xs font-bold text-white"><Editable initialValue={cert.name} isPrinting={isPrinting} /></p>
                    <p className="text-[11px] text-slate-400">
                      <Editable initialValue={cert.issuer} isPrinting={isPrinting} />
                      {cert.year ? <> · <Editable initialValue={cert.year} isPrinting={isPrinting} /></> : null}
                    </p>
                    {!isPrinting && (
                      <button onClick={() => setCertifications(certifications.filter((_, i) => i !== index))}
                        className="absolute top-0 right-0 text-red-400 opacity-0 group-hover:opacity-100 text-xs font-black transition-opacity">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="w-full md:w-[66%] p-8">
            <div className="mb-6">
              <Editable as="h1" initialValue={displayName} isPrinting={isPrinting} className="block text-3xl font-extrabold text-slate-900 tracking-tight leading-tight" />
              <Editable as="p" initialValue="Software Developer / Engineer" isPrinting={isPrinting} className="block text-indigo-500 text-sm font-bold uppercase tracking-[0.1em] mt-1" />
            </div>

            <div className="mb-6">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-slate-800 border-b-2 border-slate-800 pb-1.5 mb-3">Profile</h2>
              <Editable as="p" initialValue={summarySeed} isPrinting={isPrinting} className="block text-slate-600 text-[13px] leading-relaxed" />
            </div>

            <div className="mb-6">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-slate-800 border-b-2 border-slate-800 pb-1.5 mb-3">GitHub Analytics</h2>
              <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                {statCards.map(({ label, val }, i) => (
                  <div key={label} className="flex items-baseline gap-1.5">
                    <span className="text-[13px] font-bold text-slate-800"><Editable initialValue={String(val || 0)} isPrinting={isPrinting} /></span>
                    <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
                    {i < statCards.length - 1 && <span className="text-slate-200 ml-4">|</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center flex-wrap">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-slate-800 border-b-2 border-slate-800 pb-1.5 mb-3 flex-1">Experience</h2>
                <AddTrigger label="experience" formKey="experience" />
              </div>
              <ExperienceForm />
              {experience.length > 0 && (
                <div className="space-y-4">
                  {experience.map((exp, index) => (
                    <div key={index} className="group relative flex justify-between items-start gap-4">
                      <div>
                        <p className="font-bold text-slate-800 text-[13px]"><Editable initialValue={exp.role} isPrinting={isPrinting} /></p>
                        <p className="text-slate-500 text-xs mt-0.5"><Editable initialValue={exp.company} isPrinting={isPrinting} /></p>
                      </div>
                      <span className="text-slate-400 text-[11px] font-bold whitespace-nowrap"><Editable initialValue={exp.duration} isPrinting={isPrinting} /></span>
                      {!isPrinting && (
                        <button onClick={() => setExperience(experience.filter((_, i) => i !== index))}
                          className="absolute -left-4 top-0 text-red-400 opacity-0 group-hover:opacity-100 text-xs font-black transition-opacity">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {orderedProjects.length > 0 && (
              <div>
                <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-slate-800 border-b-2 border-slate-800 pb-1.5 mb-3">Key Projects</h2>
                <div className="space-y-4">
                  {orderedProjects.map((repo) => {
                    const bullets = generateProjectBullets(repo);
                    return (
                      <div key={repo.name}>
                        <div className="flex justify-between items-baseline">
                          <Editable as="h3" initialValue={repo.name} isPrinting={isPrinting} className="font-bold text-slate-800 text-[13px]" />
                          <span className="text-yellow-600 text-[11px] font-bold whitespace-nowrap">⭐ {repo.stars || 0}</span>
                        </div>
                        <ul className="mt-1.5 space-y-1">
                          {bullets.map((b, i) => (
                            <li key={i} className="text-slate-500 text-[11.5px] leading-relaxed flex gap-1.5">
                              <span className="text-slate-300 font-bold">–</span>
                              <Editable initialValue={b} isPrinting={isPrinting} className="flex-1" />
                            </li>
                          ))}
                        </ul>
                        {repo.url && <p className="text-blue-500 text-[10px] font-semibold mt-1 break-all">{repo.url}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 pt-3 mt-6 text-center">
              <p className="text-slate-300 text-[9px] font-semibold uppercase tracking-wider">Generated via DevPulse — devpulse.xyz/{user?.username}</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TEMPLATE: ATS-SAFE (single column, black on white, no
          color blocks, no icons — parses cleanly in ATS software)
          ══════════════════════════════════════════════════════════ */}
      {template === "ats" && (
        <div
          id="resume-preview"
          className="bg-white shadow-2xl mx-auto border border-gray-200 max-w-4xl p-10 text-black"
          style={{ fontFamily: "'Times New Roman', Georgia, serif" }}
        >
          {/* Header */}
          <div className="text-center border-b border-black pb-3 mb-4">
            <Editable as="h1" initialValue={displayName} isPrinting={isPrinting} className="block text-2xl font-bold tracking-wide" />
            <div className="text-[12px] mt-1.5 flex flex-wrap justify-center gap-x-3">
              <Editable initialValue="your@email.com" isPrinting={isPrinting} />
              <span>|</span>
              <Editable initialValue={user?.location || "Remote"} isPrinting={isPrinting} />
              <span>|</span>
              <span>github.com/{user?.username}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-4">
            <h2 className="text-[13px] font-bold uppercase border-b border-black pb-1 mb-2">Professional Summary</h2>
            <Editable as="p" initialValue={summarySeed} isPrinting={isPrinting} className="block text-[12.5px] leading-relaxed" />
          </div>

          {/* Skills */}
          {(orderedLanguages.length > 0 || orderedFrameworksTools.length > 0 || !isPrinting) && (
            <div className="mb-4">
              <div className="flex items-baseline flex-wrap">
                <h2 className="text-[13px] font-bold uppercase border-b border-black pb-1 mb-2 flex-1">Skills</h2>
                <AddTrigger label="skill" formKey="skill" />
              </div>
              <SkillForm />
              <div className="text-[12.5px] leading-relaxed space-y-1">
                {orderedLanguages.length > 0 && (
                  <p><span className="font-bold">Languages: </span>{orderedLanguages.join(", ")}</p>
                )}
                {orderedFrameworksTools.length > 0 && (
                  <p><span className="font-bold">Frameworks &amp; Tools: </span>{orderedFrameworksTools.join(", ")}</p>
                )}
              </div>
            </div>
          )}

          {/* Experience */}
          <div className="mb-4">
            <div className="flex items-baseline flex-wrap">
              <h2 className="text-[13px] font-bold uppercase border-b border-black pb-1 mb-2 flex-1">Experience</h2>
              <AddTrigger label="experience" formKey="experience" />
            </div>
            <ExperienceForm />
            {experience.length > 0 && (
              <div className="space-y-3">
                {experience.map((exp, index) => (
                  <div key={index} className="group relative">
                    <div className="flex justify-between items-baseline">
                      <p className="font-bold text-[12.5px]"><Editable initialValue={exp.role} isPrinting={isPrinting} /> — <Editable initialValue={exp.company} isPrinting={isPrinting} className="font-normal italic" /></p>
                      <span className="text-[11.5px] whitespace-nowrap"><Editable initialValue={exp.duration} isPrinting={isPrinting} /></span>
                    </div>
                    {!isPrinting && (
                      <button onClick={() => setExperience(experience.filter((_, i) => i !== index))}
                        className="absolute -left-4 top-0 text-red-500 opacity-0 group-hover:opacity-100 text-xs font-black transition-opacity">✕</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education */}
          <div className="mb-4">
            <div className="flex items-baseline flex-wrap">
              <h2 className="text-[13px] font-bold uppercase border-b border-black pb-1 mb-2 flex-1">Education</h2>
              <AddTrigger label="education" formKey="education" />
            </div>
            <EducationForm />
            {education.length > 0 && (
              <div className="space-y-2">
                {education.map((edu, index) => (
                  <div key={index} className="group relative flex justify-between items-baseline">
                    <p className="text-[12.5px]"><span className="font-bold"><Editable initialValue={edu.degree} isPrinting={isPrinting} /></span> — <Editable initialValue={edu.institute} isPrinting={isPrinting} className="italic" /></p>
                    <span className="text-[11.5px] whitespace-nowrap"><Editable initialValue={edu.year} isPrinting={isPrinting} /></span>
                    {!isPrinting && (
                      <button onClick={() => setEducation(education.filter((_, i) => i !== index))}
                        className="absolute -left-4 top-0 text-red-500 opacity-0 group-hover:opacity-100 text-xs font-black transition-opacity">✕</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certifications */}
          {(certifications.length > 0 || openForm === "certification") && (
            <div className="mb-4">
              <div className="flex items-baseline flex-wrap">
                <h2 className="text-[13px] font-bold uppercase border-b border-black pb-1 mb-2 flex-1">Certifications</h2>
                <AddTrigger label="cert" formKey="certification" />
              </div>
              <CertForm />
              <div className="space-y-1.5">
                {certifications.map((cert, index) => (
                  <div key={index} className="group relative flex justify-between items-baseline">
                    <p className="text-[12.5px]"><Editable initialValue={cert.name} isPrinting={isPrinting} /> — <Editable initialValue={cert.issuer} isPrinting={isPrinting} className="italic" /></p>
                    <span className="text-[11.5px]"><Editable initialValue={cert.year} isPrinting={isPrinting} /></span>
                    {!isPrinting && (
                      <button onClick={() => setCertifications(certifications.filter((_, i) => i !== index))}
                        className="absolute -left-4 top-0 text-red-500 opacity-0 group-hover:opacity-100 text-xs font-black transition-opacity">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {orderedProjects.length > 0 && (
            <div className="mb-4">
              <h2 className="text-[13px] font-bold uppercase border-b border-black pb-1 mb-2">Projects</h2>
              <div className="space-y-3">
                {orderedProjects.map((repo) => {
                  const bullets = generateProjectBullets(repo);
                  return (
                    <div key={repo.name}>
                      <Editable as="p" initialValue={repo.name} isPrinting={isPrinting} className="font-bold text-[12.5px]" />
                      <ul className="ml-4 list-disc space-y-0.5">
                        {bullets.map((b, i) => (
                          <li key={i} className="text-[12px] leading-relaxed">
                            <Editable initialValue={b} isPrinting={isPrinting} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* GitHub stats — plain line, ATS-friendly */}
          <div>
            <h2 className="text-[13px] font-bold uppercase border-b border-black pb-1 mb-2">GitHub Activity</h2>
            <p className="text-[12.5px]">
              {statCards.map(({ label, val }, i) => (
                <span key={label}>
                  <Editable initialValue={String(val || 0)} isPrinting={isPrinting} /> {label}{i < statCards.length - 1 ? " · " : ""}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Resume;