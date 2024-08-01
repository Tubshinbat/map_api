const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");
// a
const {
  createWebInfo,
  updateWebInfo,
  getWebInfo,
} = require("../controller/WebInfo");

router
  .route("/")
  .post(protect, authorize("admin"), createWebInfo)
  .get(getWebInfo);

router.route("/").put(protect, authorize("admin"), updateWebInfo);

module.exports = router;
