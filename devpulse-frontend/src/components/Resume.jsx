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

const [editMode, setEditMode] = useState({
  name: false,
  email: false,
  bio: false,
});

const handleBlurSave = (field) => {
  setEditMode({ ...editMode, [field]: false });
};

const [eduEditIndex, setEduEditIndex] = useState(null);
const [expEditIndex, setExpEditIndex] = useState(null);

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

       {editMode.name ? (
  <input
    value={editableData.name}
    onChange={(e) =>
      setEditableData({
        ...editableData,
        name: e.target.value,
      })
    }
    onBlur={() => handleBlurSave("name")}
    autoFocus
    className="text-3xl font-bold border-b outline-none"
  />
) : (
  <h1
    onClick={() =>
      setEditMode({ ...editMode, name: true })
    }
    className="text-3xl font-bold cursor-pointer"
  >
    {editableData.name}
  </h1>
)}

        <p className="text-lg text-gray-600 mt-1">
          @{user?.username}
        </p>

        <div className="mt-4 space-y-2 text-gray-700">

         <div className="flex items-center gap-2">
  <span>📧</span>

  {editMode.email ? (
  <input
    value={editableData.email}
    onChange={(e) =>
      setEditableData({
        ...editableData,
        email: e.target.value,
      })
    }
    onBlur={() => handleBlurSave("email")}
    autoFocus
  />
) : (
  <p
    onClick={() =>
      setEditMode({ ...editMode, email: true })
    }
    className="cursor-pointer"
  >
     {editableData.email}
  </p>
)}
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

 {editMode.bio ? (
  <textarea
    value={editableData.bio}
    onChange={(e) =>
      setEditableData({
        ...editableData,
        bio: e.target.value,
      })
    }
    onBlur={() => handleBlurSave("bio")}
    autoFocus
    className="w-full border p-2"
  />
) : (
  <p
    onClick={() =>
      setEditMode({ ...editMode, bio: true })
    }
    className="cursor-pointer text-gray-600"
  >
    {editableData.bio}
  </p>
)}
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
    <div key={index} className="border p-3 rounded-lg">

      {/* DEGREE */}
      {eduEditIndex === index ? (
        <input
          value={edu.degree}
          onChange={(e) => {
            const updated = [...education];
            updated[index].degree = e.target.value;
            setEducation(updated);
          }}
          onBlur={() => setEduEditIndex(null)}
          autoFocus
        />
      ) : (
        <h3
          onClick={() => setEduEditIndex(index)}
          className="font-bold cursor-pointer"
        >
          {edu.degree}
        </h3>
      )}

      {/* INSTITUTE */}
      <p>{edu.institute}</p>

      {/* YEAR */}
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
  <div key={index} className="border p-3 rounded-lg">

    {expEditIndex === index ? (
      <input
        value={exp.company}
        onChange={(e) => {
          const updated = [...experience];
          updated[index].company = e.target.value;
          setExperience(updated);
        }}
        onBlur={() => setExpEditIndex(null)}
        autoFocus
      />
    ) : (
      <h3
        onClick={() => setExpEditIndex(index)}
        className="font-bold cursor-pointer"
      >
        {exp.company}
      </h3>
    )}

    <p>{exp.role}</p>
    <p>{exp.duration}</p>
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