require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const axios = require("axios");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const calculateScore = require("./utils/scoreCalculator");
const app = express();
const router = express.Router();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log("MongoDB Error:", err);
});

// Test route
app.get("/", (req, res) => {
    res.send("Server running");
});

// GitHub USER route
app.get("/api/user/:username", async (req, res) => {
    try {
        const username = req.params.username;

        const response = await axios.get(
            `https://api.github.com/users/${username}`,
            {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`
                }
            }
        );

        const data = response.data;

        const reposResponse = await axios.get(
            `https://api.github.com/users/${username}/repos`,
            {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`
                }
            }
        );

        const totalStars = reposResponse.data.reduce(
            (sum, repo) => sum + repo.stargazers_count,
            0
        );

        const prResponse = await axios.get(
            `https://api.github.com/search/issues?q=author:${username}+type:pr`,
            {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`
                }
            }
        );

        const totalPRs = prResponse.data.total_count;

        const repos = reposResponse.data;

        let totalCommits = 0;

        await Promise.all(
            repos.map(async (repo) => {
                try {
                    const commitRes = await axios.get(
                        `https://api.github.com/repos/${username}/${repo.name}/commits?per_page=1`,
                        {
                            headers: {
                                Authorization: `token ${process.env.GITHUB_TOKEN}`
                            }
                        }
                    );

                    const linkHeader = commitRes.headers["link"];

                    if (linkHeader) {
                        const match = linkHeader.match(
                            /page=(\d+)>; rel="last"/
                        );

                        if (match) {
                            totalCommits += parseInt(match[1]);
                        }
                    } else {
                        totalCommits += commitRes.data.length;
                    }

                } catch (err) {
                    // Skip empty repos
                }
            })
        );

        const score = calculateScore({
            commits: totalCommits,
            repos: data.public_repos,
            stars: totalStars,
            prs: totalPRs,
            followers: data.followers
        });

        const userInfo = {
            name: data.name,
            username: data.login,
            bio: data.bio,
            avatar: data.avatar_url,
            followers: data.followers,
            location: data.location,
            joined: data.created_at,
            email: data.email,   
            score: score
        };

        res.json(userInfo);

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                message: "GitHub user not found"
            });
        }

        console.error(error.message);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// GitHub REPOS route
app.get("/api/repos/:username", async (req, res) => {
    try {
        const username = req.params.username;

        const response = await axios.get(
            `https://api.github.com/users/${username}/repos`,
            {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`
                }
            }
        );

        const repos = response.data;

        const totalStars = repos.reduce(
            (sum, repo) => sum + repo.stargazers_count,
            0
        );

        const formattedRepos = await Promise.all(
            repos.map(async (repo) => {
                const langRes = await axios.get(
                    `https://api.github.com/repos/${username}/${repo.name}/languages`,
                    {
                        headers: {
                            Authorization: `token ${process.env.GITHUB_TOKEN}`
                        }
                    }
                );

                return {
                    name: repo.name,
                    description: repo.description,
                    full_name: repo.full_name,
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    language: repo.language,
                    languages: Object.keys(langRes.data),
                    url: repo.html_url
                };
            })
        );

        res.json({
            totalRepos: repos.length,
            totalStars: totalStars,
            repos: formattedRepos
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// REGISTER
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser)
            return res.status(400).json({
                message: "User already exists"
            });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.json({
            message: "User registered successfully",
            userId: user._id
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// LOGIN
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).json({
                message: "User not found"
            });

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch)
            return res.status(400).json({
                message: "Invalid password"
            });

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({ token });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// COMMITS COUNT
app.get("/api/commits/:username", async (req, res) => {
    try {
        const username = req.params.username;

        const reposRes = await axios.get(
            `https://api.github.com/users/${username}/repos`,
            {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`
                }
            }
        );

        const repos = reposRes.data;

        let totalCommits = 0;

        await Promise.all(
            repos.map(async (repo) => {
                try {
                    const commitRes = await axios.get(
                        `https://api.github.com/repos/${username}/${repo.name}/commits?per_page=1`,
                        {
                            headers: {
                                Authorization: `token ${process.env.GITHUB_TOKEN}`
                            }
                        }
                    );

                    const linkHeader = commitRes.headers["link"];

                    if (linkHeader) {
                        const match = linkHeader.match(
                            /page=(\d+)>; rel="last"/
                        );

                        if (match) {
                            totalCommits += parseInt(match[1]);
                        }
                    } else {
                        totalCommits += commitRes.data.length;
                    }

                } catch (err) {
                    // Skip empty repos
                }
            })
        );

        res.json({
            totalCommits
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// PULL REQUESTS COUNT
app.get("/api/pullrequests/:username", async (req, res) => {
    try {
        const username = req.params.username;

        const response = await axios.get(
            `https://api.github.com/search/issues?q=author:${username}+type:pr`,
            {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`
                }
            }
        );

        res.json({
            totalPullRequests: response.data.total_count
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// ══════════════════════════════════════════════════════════════════
// ADD THIS ROUTE to your server.js, near your other repo-related
// routes (e.g. after /api/repos/:username).
//
// Scores each repo 0-100 on real maintenance signals instead of star
// count: does it have a README, a license, and was it touched
// recently. Returns per-repo results so the frontend can show exactly
// what's missing on each project.
// ══════════════════════════════════════════════════════════════════

app.get("/api/repo-health/:username", async (req, res) => {
    try {
        const username = req.params.username;

        const reposRes = await axios.get(
            `https://api.github.com/users/${username}/repos`,
            {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`
                }
            }
        );

        const repos = reposRes.data;
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const healthResults = await Promise.all(
            repos.map(async (repo) => {
                let hasReadme = false;
                try {
                    await axios.get(
                        `https://api.github.com/repos/${username}/${repo.name}/readme`,
                        {
                            headers: {
                                Authorization: `token ${process.env.GITHUB_TOKEN}`
                            }
                        }
                    );
                    hasReadme = true;
                } catch (err) {
                    hasReadme = false; // 404 means no README
                }

                const hasLicense = !!repo.license;
                const hasDescription = !!(repo.description && repo.description.trim().length > 0);
                const isRecent = new Date(repo.pushed_at) >= sixMonthsAgo;

                let score = 0;
                if (hasReadme) score += 40;
                if (hasLicense) score += 25;
                if (isRecent) score += 25;
                if (hasDescription) score += 10;

                return {
                    name: repo.name,
                    score,
                    hasReadme,
                    hasLicense,
                    hasDescription,
                    isRecent,
                    lastPush: repo.pushed_at
                };
            })
        );

        res.json({ repos: healthResults });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// ══════════════════════════════════════════════════════════════════
// ADD THIS ROUTE to your server.js, near your existing
// /api/contributions/:username route (they use the same GitHub
// GraphQL query — this one just keeps the daily data instead of
// collapsing it down to monthly totals).
// ══════════════════════════════════════════════════════════════════

// HEATMAP DATA — full year of daily contribution counts, GitHub-style
app.get("/api/heatmap/:username", async (req, res) => {
  try {
    const username = req.params.username;

    const query = {
      query: `
      {
        user(login: "${username}") {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
      `
    };

    const response = await axios.post(
      "https://api.github.com/graphql",
      query,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
        }
      }
    );

    const calendar = response.data.data.user.contributionsCollection.contributionCalendar;

    // Flatten into a simple array of { date, count } — easiest shape
    // for the frontend to render into a grid
    const days = [];
    calendar.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        days.push({
          date: day.date,
          count: day.contributionCount
        });
      });
    });

    res.json({
      totalContributions: calendar.totalContributions,
      days
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// ACTIVITY DATA — commit dates + messages, for streaks/time patterns/message quality
app.get("/api/activity/:username", async (req, res) => {
    try {
        const username = req.params.username;

        const reposRes = await axios.get(
            `https://api.github.com/users/${username}/repos`,
            {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`
                }
            }
        );

        const repos = reposRes.data;
        let commitLog = [];

        // Pull up to 30 recent commits per repo (keeps this fast and avoids
        // hitting GitHub's rate limit on users with many repos). Capped at
        // 300 commits total across all repos.
        await Promise.all(
            repos.map(async (repo) => {
                if (commitLog.length >= 300) return;
                try {
                    const commitRes = await axios.get(
                        `https://api.github.com/repos/${username}/${repo.name}/commits`,
                        {
                            params: { per_page: 30, author: username },
                            headers: {
                                Authorization: `token ${process.env.GITHUB_TOKEN}`
                            }
                        }
                    );

                    commitRes.data.forEach((commit) => {
                        commitLog.push({
                            date: commit.commit.author.date,
                            message: commit.commit.message.split("\n")[0], // first line only
                        });
                    });
                } catch (err) {
                    // Skip repos with no commits or access issues
                }
            })
        );

        res.json({ commits: commitLog });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// FIXED: Contributions route dynamic month logic
app.get("/api/contributions/:username", async (req, res) => {
  try {
    const username = req.params.username;

    const query = {
      query: `
      {
        user(login: "${username}") {
          contributionsCollection {
            contributionCalendar {
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
      `
    };

    const response = await axios.post(
      "https://api.github.com/graphql",
      query,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
        }
      }
    );

    // DYNAMICALLY GENERATE LAST 6 MONTHS KEYS (with en-US locale to prevent locale issues)
    const monthlyData = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toLocaleString("en-US", { month: "short" });
      monthlyData[monthKey] = 0;
    }

    const weeks = response.data.data.user.contributionsCollection.contributionCalendar.weeks;

    weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        // Explicitly format to en-US short month (e.g. "Jul") to match generated keys
        const month = new Date(day.date).toLocaleString("en-US", {
          month: "short"
        });

        if (monthlyData[month] !== undefined) {
          monthlyData[month] += day.contributionCount;
        }
      });
    });

    res.json(monthlyData);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Store OTPs temporarily
const otpStore = {};

// SEND OTP
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "DevPulse Password Reset OTP",
      html: `<h2>Your OTP is: <b>${otp}</b></h2><p>This OTP expires in 10 minutes.</p>`,
    });

    res.json({ message: "OTP sent to email" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VERIFY OTP + RESET PASSWORD
app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = otpStore[email];
    if (!record) return res.status(400).json({ message: "OTP not found" });
    if (record.otp !== otp) return res.status(400).json({ message: "Wrong OTP" });
    if (Date.now() > record.expires) return res.status(400).json({ message: "OTP expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    delete otpStore[email];

    res.json({ message: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
