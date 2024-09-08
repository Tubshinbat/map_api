const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createDistrict,
  getDistrict,
  getDistricts,
  searchDistrict,
  getAllData,
  getCountDistrict,
  multDeleteDistrict,
  deleteDistrict,
  updateDistrict,
} = require("../controller/District");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createDistrict)
  .get(getDistricts);

router.route("/search").get(searchDistrict);
router.route("/all").get(getAllData);
router.route("/count").get(getCountDistrict);
router.route("/delete").delete(protect, authorize("admin"), multDeleteDistrict);

router
  .route("/:id")
  .get(getDistrict)
  .delete(protect, authorize("admin"), deleteDistrict)
  .put(protect, authorize("admin", "operator"), updateDistrict);

module.exports = router;
