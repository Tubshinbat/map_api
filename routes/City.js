const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createCity,
  getCitys,
  changePosition,
  getCity,
  multDeleteCity,
  updateCity,
  getCountCity,
  deleteCity,
  getAllData,
  searchCity,
} = require("../controller/City");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createCity)
  .get(getCitys);

router
  .route("/change")
  .post(protect, authorize("admin", "operator"), changePosition);

router.route("/search").get(searchCity);
router.route("/all").get(getAllData);
router.route("/count").get(getCountCity);
router.route("/delete").delete(protect, authorize("admin"), multDeleteCity);

router
  .route("/:id")
  .get(getCity)
  .delete(protect, authorize("admin"), deleteCity)
  .put(protect, authorize("admin", "operator"), updateCity);

module.exports = router;
