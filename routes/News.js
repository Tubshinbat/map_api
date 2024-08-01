const express = require("express");
const router = express.Router();

const {
  createNews,
  getNews,
  multDeleteNews,
  getSingleNews,
  updateNews,
  getSlugSingleNews,
  getCountNews,
} = require("../controller/News");
const { protect, authorize } = require("../middleware/protect");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createNews)
  .get(getNews);
router.route("/slug/:slug").get(getSlugSingleNews);

router.route("/count").get(getCountNews);

router.route("/delete").delete(protect, authorize("admin"), multDeleteNews);
router
  .route("/:id")
  .get(getSingleNews)
  .put(protect, authorize("admin", "operator"), updateNews);

module.exports = router;
