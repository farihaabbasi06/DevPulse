function Resume({ user, stats, languages }) {
    const techStack = Object.keys(languages || {});
  return (
    <div className="bg-white text-black rounded-xl p-8 shadow-lg">
      <h1 className="text-4xl font-bold text-center">
        Developer Resume
      </h1>
    </div>
  );
}

export default Resume;