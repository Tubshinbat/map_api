const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getPlaces,
  createPlace,
  multDeletePlace,
  getPlace,
  updatePlace,
  getCountPlace,
  getRandomCategoryPlaces,
  placeSearch,
  coordinateSearch,
} = require("../controller/Place");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createPlace)
  .get(getPlaces);

router.route("/nearbysearch").get(coordinateSearch);
router.route("/random-place-categories").get(getRandomCategoryPlaces);
router.route("/search").get(placeSearch);
router.route("/count").get(getCountPlace);

router.route("/delete").delete(protect, authorize("admin"), multDeletePlace);
router
  .route("/:id")
  .get(getPlace)
  .put(protect, authorize("admin", "operator"), updatePlace);

module.exports = router;
