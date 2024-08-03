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
} = require("../controller/Place");
const { getTopRatedPlaces } = require("../controller/Rate");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createPlace)
  .get(getPlaces);

router.route("/count").get(getCountPlace);
router.route('/top-rated-places').get(getTopRatedPlaces)
router.route("/delete").delete(protect, authorize("admin"), multDeletePlace);
router
  .route("/:id")
  .get(getPlace)
  .put(protect, authorize("admin", "operator"), updatePlace);

module.exports = router;
