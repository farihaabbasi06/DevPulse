import { useState, useEffect } from "react";
function Resume({ user, stats, languages, repos }) {
   const skills = Object.keys(languages || {}).slice(0, 8);
   const topProjects = (repos || []).slice(0, 3);
   const summary = `${user?.name} is a software developer with experience in ${skills.slice(0, 4).join(", ")}. Passionate about building software projects and contributing to open-source development.`;
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
   return (
  <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
    <div className="bg-white w-full max-w-4xl shadow-xl rounded-lg p-10">

      <div className="border-b pb-6">

       <input
  type="text"
  value={editableData.name}
  onChange={(e) =>
    setEditableData({
      ...editableData,
      name: e.target.value,
    })
  }
  className="text-4xl font-bold text-gray-900 w-full border-b-2 border-transparent focus:border-pink-500 outline-none bg-transparent"
/>

        <p className="text-lg text-gray-600 mt-1">
          @{user?.username}
        </p>

        <div className="mt-4 space-y-2 text-gray-700">

         <div className="flex items-center gap-2">
  <span>📧</span>

  <input
    type="email"
    value={editableData.email}
    placeholder="Enter your email"
    onChange={(e) =>
      setEditableData({
        ...editableData,
        email: e.target.value,
      })
    }
    className="w-full border-b border-transparent focus:border-pink-500 outline-none bg-transparent"
  />
</div>

          <p>
            📍 {user?.location || "Location not specified"}
          </p>

          <p>
            🌐 https://github.com/{user?.username}
          </p>
          <div className="mt-8">

            <div className="mt-8">
  <h2 className="text-2xl font-bold text-gray-800 mb-3">
    Professional Summary
  </h2>

  <textarea
  rows="4"
  value={editableData.bio}
  placeholder="Write a short professional summary..."
  onChange={(e) =>
    setEditableData({
      ...editableData,
      bio: e.target.value,
    })
  }
  className="w-full border rounded-lg p-3 outline-none focus:border-pink-500 resize-none"
/>
</div>
<div className="mt-8">
  <h2 className="text-2xl font-bold text-gray-800 mb-4">
    Education
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

    <input
      type="text"
      placeholder="Degree"
      value={educationForm.degree}
      onChange={(e) =>
        setEducationForm({
          ...educationForm,
          degree: e.target.value,
        })
      }
      className="border rounded-lg p-2"
    />

    <input
      type="text"
      placeholder="Institute"
      value={educationForm.institute}
      onChange={(e) =>
        setEducationForm({
          ...educationForm,
          institute: e.target.value,
        })
      }
      className="border rounded-lg p-2"
    />

    <input
      type="text"
      placeholder="Year"
      value={educationForm.year}
      onChange={(e) =>
        setEducationForm({
          ...educationForm,
          year: e.target.value,
        })
      }
      className="border rounded-lg p-2"
    />

  </div>

 <button
  onClick={() => {
    if (
      educationForm.degree &&
      educationForm.institute &&
      educationForm.year
    ) {
      setEducation([
        ...education,
        educationForm,
      ]);

      setEducationForm({
        degree: "",
        institute: "",
        year: "",
      });
    }
  }}
  className="mt-4 bg-pink-500 text-white px-5 py-2 rounded-lg"
>
  Add Education
</button>

<div className="mt-6 space-y-3">
  {education.map((edu, index) => (
    <div
      key={index}
      className="border rounded-lg p-3"
    >
      <h3 className="font-bold">
        {edu.degree}
      </h3>

      <p>{edu.institute}</p>

      <p>{edu.year}</p>
    </div>
  ))}
</div>


<div className="mt-8">
  <h2 className="text-2xl font-bold text-gray-800 mb-4">
    Experience
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

    <input
      type="text"
      placeholder="Company"
      value={experienceForm.company}
      onChange={(e) =>
        setExperienceForm({
          ...experienceForm,
          company: e.target.value,
        })
      }
      className="border rounded-lg p-2"
    />

    <input
      type="text"
      placeholder="Role"
      value={experienceForm.role}
      onChange={(e) =>
        setExperienceForm({
          ...experienceForm,
          role: e.target.value,
        })
      }
      className="border rounded-lg p-2"
    />

    <input
      type="text"
      placeholder="Duration"
      value={experienceForm.duration}
      onChange={(e) =>
        setExperienceForm({
          ...experienceForm,
          duration: e.target.value,
        })
      }
      className="border rounded-lg p-2"
    />

  </div>

  <button
  onClick={() => {
    if (
      experienceForm.company &&
      experienceForm.role &&
      experienceForm.duration
    ) {
      setExperience([
        ...experience,
        experienceForm,
      ]);

      setExperienceForm({
        company: "",
        role: "",
        duration: "",
      });
    }
  }}
  className="mt-4 bg-pink-500 text-white px-5 py-2 rounded-lg"
>
  Add Experience
</button>

<div className="mt-6 space-y-3">
  {experience.map((exp, index) => (
    <div
      key={index}
      className="border rounded-lg p-3"
    >
      <h3 className="font-bold">
        {exp.company}
      </h3>

      <p>{exp.role}</p>

      <p className="text-gray-600">
        {exp.duration}
      </p>
    </div>
  ))}

  
</div>

</div>

</div>
<input
  type="text"
  value={skillInput}
  placeholder="Type skill and press Enter"
  onChange={(e) => setSkillInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && skillInput.trim() !== "") {
      setExtraSkills([...extraSkills, skillInput]);
      setSkillInput("");
    }
  }}
  className="border p-2 w-full rounded-lg mb-4"
/>
  <h2 className="text-2xl font-bold text-gray-800 mb-3">
  Skills
</h2>

<div className="flex flex-wrap gap-2">
  {uniqueSkills.map((skill, index) => (
  <span
    key={index}
    onClick={() => {
      setExtraSkills(extraSkills.filter(s => s !== skill));
    }}
    className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-red-200"
  >
    {skill}
  </span>
))}
</div>
</div>
          
          <div className="mt-10">
  <h2 className="text-2xl font-bold text-gray-800 mb-4">
    Projects
  </h2>

  {topProjects.map((repo) => (
    <div
      key={repo.name}
      className="border rounded-lg p-4 mb-4"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">
          {repo.name}
        </h3>

        <span className="text-yellow-600 font-semibold">
          ⭐ {repo.stars}
        </span>
      </div>

      <p className="text-gray-600 mt-2">
        {repo.description || "No description available"}
      </p>

      <a
        href={repo.url}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 underline mt-2 inline-block"
      >
        View on GitHub
      </a>
    </div>
  ))}
</div>
            
        </div>
 <div className="mt-6">
  <span className="bg-pink-500 text-white px-5 py-2 rounded-full font-bold text-lg">
    DevPulse Score: {user?.score}/100
  </span>
</div>
      </div>


     
      
    </div>
  </div>
);
}

export default Resume;