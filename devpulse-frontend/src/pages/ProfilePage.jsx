import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import DevCard from "../components/DevCard";

function ProfilePage() {
  const { username } = useParams();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
const [languages, setLanguages] = useState({});

  useEffect(() => {
    
    axios
      .get(`http://localhost:5000/api/user/${username}`)
      .then((res) => {
        setUser(res.data);

        axios
  .get(`http://localhost:5000/api/repos/${username}`)
  .then((repoRes) => {
    const repos = repoRes.data;

    let langCount = {};

    repos.repos.forEach((repo) => {
      repo.languages.forEach((lang) => {
        langCount[lang] = (langCount[lang] || 0) + 1;
      });
    });

    setLanguages(langCount);

    axios
  .get(`http://localhost:5000/api/commits/${username}`)
  .then((res) => {
    setStats((prev) => ({
      ...prev,
      commits: res.data.totalCommits,
    }));
  });

axios
  .get(`http://localhost:5000/api/pullrequests/${username}`)
  .then((res) => {
    setStats((prev) => ({
      ...prev,
      prs: res.data.totalPullRequests,
    }));
  });

    setStats({
      repos: repos.totalRepos,
      stars: repos.totalStars,
      repos: repos.totalRepos,
  stars: repos.totalStars,
    });
  });

      })
      .catch((err) => {
        console.log(err);
      });
  }, [username]);

  if (!user) {
    return <h1>Loading...</h1>;
  }

  return (
  <div className="min-h-screen bg-black flex justify-center items-center">
    <DevCard
      user={user}
      stats={stats}
      languages={languages}
      theme="pink"
    />
  </div>
);
}

export default ProfilePage;