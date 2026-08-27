const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // GitHub verification — added for the "Verify Profile" feature.
    // Both stay null until the user completes the GitHub OAuth flow.
    githubUsername: { type: String, default: null, lowercase: true },
    githubVerifiedAt: { type: Date, default: null }
});

module.exports = mongoose.model("User", UserSchema);