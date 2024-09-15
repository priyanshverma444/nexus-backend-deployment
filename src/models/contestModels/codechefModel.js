const mongoose = require("mongoose");

const codechefSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
    },
    isEnrolled: { type: Boolean, required: true, default: false },
    success: { type: Boolean },
    name: { type: String },
    profile: { type: String },
    beforeRating: { type: Number },
    afterRating: { type: Number },
    currentRating: { type: Number },
    highestRating: { type: Number },
    globalRank: { type: Number },
    countryRank: { type: Number },
    stars: { type: Number },
    contestGlobalRank: { type: Number },
    contestRatingDiff: { type: Number },
    contestName: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Codechef", codechefSchema);
