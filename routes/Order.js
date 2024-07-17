const express = require("express");
const router = express.Router();

const {
  createOrder,
  createOrderWithQPay,
  multipleDeleteOrder,
  getOrders,
} = require("../controller/Order");
const { protect, authorize } = require("../middleware/protect");

router
  .route("/")
  .post(protect, createOrder)
  .get(protect, authorize("admin", "operator"), getOrders);

router.route("/").post(protect, createOrderWithQPay);

router.route("/slug/:slug").get(getSlugSingleNews);

router.route("/count").get(getCountNews);

router
  .route("/delete")
  .delete(protect, authorize("admin"), multipleDeleteOrder);
router
  .route("/:id")
  .get(getSingleNews)
  .put(protect, authorize("admin", "operator"), updateNews);

module.exports = router;
