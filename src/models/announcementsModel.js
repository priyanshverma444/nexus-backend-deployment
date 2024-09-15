const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["high", "medium", "low"] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Announcements", announcementSchema);
