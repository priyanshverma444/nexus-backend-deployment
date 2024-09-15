const express = require("express");
const router = express.Router();
const {
  getContests,
  getContest,
  postContests,
  updateContest,
  deleteContest,
} = require("../controllers/ContestControllers");
const {
  getCodechefProfile,
  getCodechefUser,
  updateCodechefProfile,
  enrollUser,
  updateAllCodechefProfiles,
  generateWinners,
  getAllWinners,
  getContestsAllWinners,
} = require("../controllers/CodechefController");

router.route("/").get(getContests).post(postContests);
router.route("/:id").get(getContest).put(updateContest).delete(deleteContest);
router
  .route("/codechef/:id")
  .get(getCodechefProfile)
  .put(updateCodechefProfile);
router.route("/codechef/enroll/:id").put(enrollUser);
router.route("/codechef/getuser/:id").get(getCodechefUser);
router.route("/codechef/update/allusers").put(updateAllCodechefProfiles);
router.route("/codechef/generate/allwinners/:contestName").get(generateWinners);
router.route("/codechef/get/allwinners").get(getAllWinners);
router
  .route("/codechef/get/allwinners/:contestName")
  .get(getContestsAllWinners);

module.exports = router;
