const axios = require("axios");
const jsdom = require("jsdom");
const express = require("express");
const app = express();
const { JSDOM } = jsdom;
const Codechef = require("../models/contestModels/codechefModel");
const User = require("../models/userModel");
const { get } = require("mongoose");
const codechefWinnersModel = require("../models/contestModels/codechefWinnersModel");
const backendUrl = process.env.BACKEND_URI;

// @desc Get codechef profile
// @route Get api/contests/codechef/:id
// @access public

const getCodechefProfile = async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    if (apiKey !== `Bearer ${process.env.API_KEY}`) {
      throw new Error("Unauthorized");
    }

    const response = await axios.get(
      `https://www.codechef.com/users/${req.params.id}`
    );

    // Parse HTML
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // Extract information
    const profileImage = document.querySelector(".user-details-container")
      .children[0].children[0].src;
    const name = document.querySelector(".user-details-container").children[0]
      .children[1].textContent;
    const currentRating = parseInt(
      document.querySelector(".rating-number").textContent
    );
    const highestRating = parseInt(
      document
        .querySelector(".rating-number")
        .parentNode.children[4].textContent.split("Rating")[1]
    );
    const countryFlag = document.querySelector(".user-country-flag").src;
    const countryName =
      document.querySelector(".user-country-name").textContent;
    const globalRank = parseInt(
      document.querySelector(".rating-ranks").children[0].children[0]
        .children[0].children[0].innerHTML
    );
    const countryRank = parseInt(
      document.querySelector(".rating-ranks").children[0].children[1]
        .children[0].children[0].innerHTML
    );
    const stars = document.querySelector(".rating").textContent || "unrated";

    const contestGlobalRank = parseInt(
      document.querySelector(".global-rank").innerHTML
    );
    const contestRatingDiff = parseInt(
      document.querySelector(".rating-difference").innerHTML
    );

    const contestName =
      document.querySelector(".contest-name").children[0].innerHTML;

    // Send success response
    res.status(200).json({
      success: true,
      profile: profileImage,
      name,
      currentRating,
      highestRating,
      countryFlag,
      countryName,
      globalRank,
      countryRank,
      stars,
      contestGlobalRank,
      contestRatingDiff,
      contestName,
    });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(`Profile not found for user id: ${req.params.id}`);
    }
    res.status(404).json({ success: false, error: error.message });
  }
};

// @desc Get codechef user from own database
// @route Get api/contests/codechef/:id
// @access public
const getCodechefUser = async (req, res) => {
  const apiKey = req.headers.authorization;
  if (apiKey !== `Bearer ${process.env.API_KEY}`) {
    throw new Error("Unauthorized");
  }

  try {
    const codechefUser = await Codechef.findOne({ user_id: req.params.id });
    if (!codechefUser) {
      res.status(404);
      throw new Error("User not found");
    }
    res.status(200).send({ data: codechefUser });
  } catch (error) {
    console.error(error);
    res.send({ error: "can't find user" });
  }
};

// @desc Update codechef profile
// @route PUT api/contests/codechef/:id
// @access public
const updateCodechefProfile = async (req, res) => {
  const apiKey = req.headers.authorization;
  if (apiKey !== `Bearer ${process.env.API_KEY}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    const apiKey = process.env.API_KEY;

    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };

    const response = await axios.get(
      `${backendUrl}/api/contests/codechef/` + user.codechefId,
      { headers }
    );
    const responseData = response.data;
    try {
      const codechef = await Codechef.findOne({ user_id: req.params.id });
      if (codechef) {
        codechef.success = true;
        codechef.profile = responseData.profile;
        codechef.name = responseData.name;
        codechef.currentRating = responseData.currentRating;
        codechef.highestRating = responseData.highestRating || null;
        codechef.globalRank = responseData.globalRank || null;
        codechef.countryRank = responseData.countryRank || null;
        codechef.contestGlobalRank = responseData.contestGlobalRank || null;
        codechef.contestRatingDiff = responseData.contestRatingDiff || null;
        codechef.contestName = responseData.contestName || null;
        if (responseData.stars && responseData.stars.match(/\d+/)) {
          codechef.stars = parseInt(responseData.stars.match(/\d+/)[0], 10);
        } else {
          codechef.stars = 1;
        }

        await codechef.save();
        user.userImg = responseData.profile;
        await user.save();
        res.status(200).send({ success: true, data: codechef });
      } else {
        console.log("No document found");
      }
    } catch (error) {
      console.error(error);
    }
  } catch (err) {
    console.log(err);
    res.send({ success: false, error: err });
  }
};

// @desc Enroll user
// @route PUT api/contests/codechef/enroll/:id
// @access public
const enrollUser = async (req, res) => {
  const apiKey = req.headers.authorization;
  if (apiKey !== `Bearer ${process.env.API_KEY}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const codechefUser = await Codechef.findOne({ user_id: req.params.id });
    if (!codechefUser) {
      res.status(404);
      throw new Error("User not found");
    }
    codechefUser.isEnrolled = true;
    await codechefUser.save();
    res.status(200).send({ success: true, data: codechefUser });
  } catch (error) {
    console.error(error);
    res.send({ error: "can't find user" });
  }
};

// @desc update the codechefId datails after every contests
// @route PUT api/contests/codechef/update/allusers
// @access public
const updateAllCodechefProfiles = async (req, res) => {
  const apiKey = req.headers.authorization;
  if (apiKey !== `Bearer ${process.env.API_KEY}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const headers = {
      Authorization: apiKey,
    };
    const userData = await User.find({
      codechefId: { $exists: true },
    });

    for (const user of userData) {
      const codechef = await Codechef.findOne({ user_id: user._id });

      if (!codechef) {
        res.status(404);
        throw new Error("User not found");
      }

      try {
        const response = await axios.get(
          `${backendUrl}/api/contests/codechef/` + user.codechefId,
          { headers }
        );
        const responseData = response.data;

        let stars = 1;

        if (responseData.stars && responseData.stars.match(/\d+/)) {
          stars = parseInt(responseData.stars.match(/\d+/)[0], 10);
        }

        codechef.set({
          currentRating: responseData.currentRating,
          highestRating: responseData.highestRating,
          globalRank: responseData.globalRank,
          countryRank: responseData.countryRank,
          stars: stars,
          contestGlobalRank: responseData.contestGlobalRank,
          contestRatingDiff: responseData.contestRatingDiff,
          contestName: responseData.contestName,
          profile: responseData.profile,
          isEnrolled: false,
        });

        await codechef.save();
        console.log(`stored ${user.username}`);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          continue;
        }
        console.error(error);
      }
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

// @desc generate all winners
// @route GET api/contests/codechef/generate/allwinners/:contestName
// @access public
const generateWinners = async (req, res) => {
  const apiKey = req.headers.authorization;
  if (apiKey !== `Bearer ${process.env.API_KEY}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const searchQuery = req.params.contestName;

    const partialMatchParticipants = await Codechef.find({
      contestName: { $regex: new RegExp(searchQuery, "i") },
      success: true,
    })
      .select("_id contestName stars contestGlobalRank contestRatingDiff")
      .populate("user_id", "username libId branch section codechefId rollNo");

    const exactMatchParticipants = await Codechef.find({
      contestName: searchQuery,
      success: true,
    }).select("-_id user_id");

    const allParticipantsSet = new Set([
      ...partialMatchParticipants,
      ...exactMatchParticipants,
    ]);
    const allParticipants = [...allParticipantsSet];
    allParticipants.sort((a, b) => a.contestGlobalRank - b.contestGlobalRank);

    const winnersData = allParticipants.map((participant) => ({
      user_id: participant.user_id._id,
      username: participant.user_id.username,
      branch: participant.user_id.branch,
      libId: participant.user_id.libId,
      section: participant.user_id.section,
      rollNo: participant.user_id.rollNo,
      codechefId: participant.user_id.codechefId,
      contestName: participant.contestName,
      contestGlobalRank: participant.contestGlobalRank,
      contestRatingDiff: participant.contestRatingDiff,
      stars: participant.stars,
    }));

    const existingContest = await codechefWinnersModel.findOne({
      contestName: searchQuery,
    });

    if (existingContest) {
      existingContest.winners.push(...winnersData);
      console.log(existingContest.winners);
      await existingContest.save();
    } else {
      // Create a new CodechefWinners document
      await codechefWinnersModel.create({
        contestName: searchQuery,
        winners: winnersData,
      });
    }

    res.status(200).json({ success: true, data: winnersData });
  } catch (error) {
    console.error("Error retrieving contest participants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc Get all winners by contest name
// @route GET api/contests/codechef/get/allwinners/:contestName
// @access public
const getContestsAllWinners = async (req, res) => {
  const apiKey = req.headers.authorization;
  if (apiKey !== `Bearer ${process.env.API_KEY}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const contestName = req.params.contestName;
    const contestWinners = await codechefWinnersModel.findOne({
      contestName: new RegExp(contestName, "i"),
    });

    if (!contestWinners) {
      res.status(404);
      throw new Error("Contest not found");
    }

    res.status(200).json({ success: true, data: contestWinners });
  } catch (error) {
    console.error("Error retrieving contest winners:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc Get all winners
// @route GET api/contests/codechef/get/allwinners
// @access public
const getAllWinners = async (req, res) => {
  const apiKey = req.headers.authorization;
  if (apiKey !== `Bearer ${process.env.API_KEY}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const contestWinners = await codechefWinnersModel.find();

    if (!contestWinners) {
      res.status(404);
      throw new Error("Contest not found");
    }

    res.status(200).json({ success: true, data: contestWinners });
  } catch (error) {
    console.error("Error retrieving contest winners:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getCodechefProfile,
  getCodechefUser,
  updateCodechefProfile,
  enrollUser,
  updateAllCodechefProfiles,
  generateWinners,
  getAllWinners,
  getContestsAllWinners,
};
