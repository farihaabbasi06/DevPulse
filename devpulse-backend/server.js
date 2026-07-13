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
    score: score

  
};

        res.json(userInfo);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching GitHub user",
            error: error.message
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

    const monthlyData = {
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0
    };

    const weeks =
      response.data.data.user.contributionsCollection
        .contributionCalendar.weeks;

    weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {

        const month = new Date(day.date)
          .toLocaleString("default", {
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