const Announcements = require("../models/announcementsModel");
const asyncHandler = require("express-async-handler");

//@desc Get all Announcements
//@route Get /api/announcements
//@access public
const getAnnouncements = asyncHandler(async (req, res) => {
  const apiKey = req.headers.authorization;
  if (apiKey !== `Bearer ${process.env.API_KEY}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const announcements = await Announcements.find();

    res.status(200).json(announcements);
  } catch (error) {
    console.log(error);
  }
});

// @desc get Announcement
// @route GET /api/announcements/:id
// @access public

const getAnnouncement = asyncHandler(async (req, res) => {
  const apiKey = req.headers.authorization;
  if (apiKey !== `Bearer ${process.env.API_KEY}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const announcement = await Announcements.findById(req.params.id);
  if (!announcement) {
    res.status(404);
    throw new Error("Announcement not found");
  }
  res.status(200).json(announcement);
});

// @desc update Announcements
// @route PUT /api/announcements/:id
// @access private

const updateAnnouncements = asyncHandler(async (req, res) => {
  const apiKey = req.headers.authorization;
  if (apiKey !== `Bearer ${process.env.API_KEY}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const announcement = await Announcements.findById(req.params.id);
  if (!announcement) {
    res.status(404);
    throw new Error("Announcement not found");
  }
  const updatedAnnouncement = await Announcements.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  res.status(200).json(updatedAnnouncement);
});

//@desc post announcements
//@route POST /api/anouncements
//@access private

const postAnnouncements = asyncHandler(async (req, res) => {
  const apiKey = req.headers.authorization;
  if (apiKey !== `Bearer ${process.env.API_KEY}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { name, description, priority, date } = req.body;

    // Check if the contest is already registered

    const announcement = await Announcements.create({
      name,
      description,
      priority,
      date,
    });
    res.status(200).json(announcement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//@desc delete announcements
//@route DELETE /api/anouncements/:id
//@access private

const deleteAnnouncements = asyncHandler(async (req, res) => {
  const apiKey = req.headers.authorization;
  if (apiKey !== `Bearer ${process.env.API_KEY}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const announcement = await Announcements.findById(req.params.id);
    if (!announcement) {
      res.status(404);
      throw new Error("Announcement not found");
    }
    await announcement.deleteOne();
    res.status(200).json({ message: "Announcement removed" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = {
  getAnnouncements,
  postAnnouncements,
  getAnnouncement,
  updateAnnouncements,
  deleteAnnouncements,
};
