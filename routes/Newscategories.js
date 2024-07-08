const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createNewsCategory,
  getNewsCategories,
  getNewsCategory,
  deletetNewsCategory,
  changePosition,
  updateNewsCategory,
  getSlugCategory,
} = require("../controller/NewsCategories");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createNewsCategory)
  .get(getNewsCategories);

router
  .route("/change")
  .post(protect, authorize("admin", "operator"), changePosition);

router.route("/slug/:slug").get(getSlugCategory);

// "/api/v1/News-categories/id"
router
  .route("/:id")
  .get(getNewsCategory)
  .delete(protect, authorize("admin"), deletetNewsCategory)
  .put(protect, authorize("admin", "operator"), updateNewsCategory);

module.exports = router;
