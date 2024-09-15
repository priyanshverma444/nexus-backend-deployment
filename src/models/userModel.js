const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    branch: {
      type: String,
      enum: ["CSE(AI)", "CSE(AIML)"],
    },
    userImg: { type: String },
    email: { type: String, required: true },
    libId: { type: String, required: true },
    bio: { type: String },
    section: { type: String, enum: ["A", "B", "C", "D"] },
    rollNo: { type: Number },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    codechefId: { type: String },
    hackerrankId: { type: String },
    leetcodeId: { type: String },
    codeforcesId: { type: String },
    githubId: { type: String },
    password: { type: String, required: true },
    enrolledContests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contest",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
