const express = require("express");
const router = express.Router();

const {
  getAnnouncements,
  postAnnouncements,
  getAnnouncement,
  updateAnnouncements,
  deleteAnnouncements,
} = require("../controllers/AnnouncementsController");

router.route("/").get(getAnnouncements).post(postAnnouncements);
router
  .route("/:id")
  .get(getAnnouncement)
  .put(updateAnnouncements)
  .delete(deleteAnnouncements);

module.exports = router;
