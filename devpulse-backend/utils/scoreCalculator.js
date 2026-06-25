function normalize(value, maxValue) {
  return Math.min((value / maxValue) * 100, 100);
}

function calculateScore({
  commits,
  repos,
  stars,
  prs,
  followers,
}) {
 const commitScore = normalize(commits, 1500000);
const repoScore = normalize(repos, 12);
const starScore = normalize(stars, 255000);
const prScore = normalize(prs, 82);
const followerScore = normalize(followers, 310000);

  const finalScore =
    commitScore * 0.30 +
    repoScore * 0.20 +
    starScore * 0.20 +
    prScore * 0.15 +
    followerScore * 0.15;

  return Math.round(finalScore);
}

module.exports = calculateScore;