const mongoose = require("mongoose");

// Generic cache for GitHub data that rarely changes (repo health,
// pinned repos). NOT used for commits/activity/heatmap — those stay
// fetched fresh every time, no caching, on purpose.
const cachedDataSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    lowercase: true
  },
  type: {
    type: String,
    required: true // e.g. "repo-health" or "pinned"
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  fetchedAt: {
    type: Date,
    default: Date.now
  }
});

// One cache entry per username+type combination
cachedDataSchema.index({ username: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("CachedData", cachedDataSchema);