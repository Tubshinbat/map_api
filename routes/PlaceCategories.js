const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createPlaceCategory,
  getPlaceCategories,
  changePosition,
  getPlaceCategory,
  deletePlaceCategory,
  updatePlaceCategory,
} = require("../controller/PlaceCategory");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createPlaceCategory)
  .get(getPlaceCategories);

router
  .route("/change")
  .post(protect, authorize("admin", "operator"), changePosition);

router
  .route("/:id")
  .get(getPlaceCategory)
  .delete(protect, authorize("admin"), deletePlaceCategory)
  .put(protect, authorize("admin", "operator"), updatePlaceCategory);

module.exports = router;
