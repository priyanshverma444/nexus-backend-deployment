const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Codechef = require("../models/contestModels/codechefModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

//@desc Get all Users
//@route Get /api/users
//@access public
const getUsers = asyncHandler(async (req, res) => {
  const apiKey = req.headers.authorization;
  if (apiKey !== `Bearer ${process.env.API_KEY}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const users = await User.find();

  res.status(200).json(users);
});

// @desc get Users
// @route GET /api/users/:id
// @access public
const getUser = asyncHandler(async (req, res) => {
  const apiKey = req.headers.authorization;
  if (apiKey !== `Bearer ${process.env.API_KEY}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json(user);
});

//@desc update Users
//@route PUT /api/users/:id
//@access public
const updateUser = asyncHandler(async (req, res) => {
  const apiKey = req.headers.authorization;
  if (apiKey !== `Bearer ${process.env.API_KEY}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedUser);
});

//@desc Register a user
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
  const apiKey = req.headers.authorization;
  if (apiKey !== `Bearer ${process.env.API_KEY}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const {
      username,
      branch,
      email,
      libId,
      bio,
      codechefId,
      password,
      rollNo,
      section,
    } = req.body;

    // Check if the user is already registered
    const userAvailable = await User.findOne({ email });
    if (userAvailable) {
      return res.status(400).json({ error: "User already registered!" });
    }

    if (email.slice(-8) !== "kiet.edu") {
      console.log(email.slice(-8));
      return res.status(504).json({ error: "User email invalid" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password: ", hashedPassword);

    // Create the user
    const user = await User.create({
      username,
      branch,
      email,
      rollNo,
      section,
      libId,
      bio,
      codechefId,
      password: hashedPassword,
    });

    const accessToken = jwt.sign(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          bio: user.bio,
          branch: user.branch,
          libId: user.libId,
          codechefId: user.codechefId,
          hackerrankId: user.hackerrankId,
          leetcodeId: user.leetcodeId,
          githubId: user.githubId,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    console.log(email.slice(-8));
    const codechefID = await Codechef.create({
      user_id: user._id,
      isEnrolled: false,
    });

    // Send a success response
    return res
      .status(200)
      .json({ message: "User registered successfully", user, accessToken });
  } catch (error) {
    // Handle any errors that occur during registration
    console.error("Error:", error);
    return res.status(500).json({ error: "Registration failed" });
  }
});

//@desc Login user
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  const apiKey = req.headers.authorization;
  if (apiKey !== `Bearer ${process.env.API_KEY}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("All fields are mandatory!");
    }
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = jwt.sign(
        {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            bio: user.bio,
            branch: user.branch,
            libId: user.libId,
            codechefId: user.codechefId,
            hackerrankId: user.hackerrankId,
            leetcodeId: user.leetcodeId,
            githubId: user.githubId,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      res.status(200).json({ accessToken });
    } else {
      res.status(401);
      throw new Error("email or password is not valid");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getUser,
  updateUser,
};
