const mongoose = require("mongoose");

const codecheWinnersSchema = new mongoose.Schema(
  {
    contestName: {
      type: String,
      required: true,
    },
    winners: [
      {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CodechefWinners", codecheWinnersSchema);
