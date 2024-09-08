const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createPolygon,
  getPolygons,
  multDeletePolygon,
  getPolygon,
  updatePolygon,
  updateWord,
  fixPolygons,
} = require("../controller/Polygon");
const { coordinateSearch } = require("../controller/Place");

router
  .route("/")
  .get(getPolygons)
  .post(protect, authorize("admin", "operator"), createPolygon);

// router.route("/test").get(updateWord);
router.route("/fixpolygon").get(fixPolygons);
router.route("/nearbysearch").get(coordinateSearch);
router
  .route("/delete")
  .delete(protect, authorize("admin", "operator"), multDeletePolygon);

router
  .route("/:id")
  .get(getPolygon)
  .put(protect, authorize("admin", "operator"), updatePolygon);

module.exports = router;
