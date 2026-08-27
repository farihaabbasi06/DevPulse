const mongoose = require("mongoose");

// A verified profile is a public fact: "this GitHub username has proven
// ownership via GitHub OAuth on DevPulse." It's checked for ANY username
// someone views (Dashboard/Portfolio), not just the currently logged-in
// DevPulse account — verification and DevPulse login are separate systems.
const verifiedProfileSchema = new mongoose.Schema({
  githubUsername: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  verifiedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("VerifiedProfile", verifiedProfileSchema);