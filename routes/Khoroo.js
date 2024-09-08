const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createKhoroo,
  getKhoroo,
  getKhoroos,
  searchKhoroo,
  getAllData,
  getCountKhoroo,
  multDeleteKhoroo,
  deleteKhoroo,
  updateKhoroo,
} = require("../controller/Khoroo");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createKhoroo)
  .get(getKhoroos);

router.route("/search").get(searchKhoroo);
router.route("/all").get(getAllData);
router.route("/count").get(getCountKhoroo);
router.route("/delete").delete(protect, authorize("admin"), multDeleteKhoroo);

router
  .route("/:id")
  .get(getKhoroo)
  .delete(protect, authorize("admin"), deleteKhoroo)
  .put(protect, authorize("admin", "operator"), updateKhoroo);

module.exports = router;
