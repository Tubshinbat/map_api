const express = require("express");
const router = express.Router();

const {
  createOrder,
  createOrderWithQPay,
  multipleDeleteOrder,
  getOrders,
  getCountOrders,
  getOrder,
  updateOrder,
} = require("../controller/Order");
const { protect, authorize } = require("../middleware/protect");

router
  .route("/")
  .post(protect, createOrder)
  .get(protect, authorize("admin", "operator"), getOrders);

router.route("/").post(protect, createOrderWithQPay);

router.route("/count").get(getCountOrders);

router
  .route("/delete")
  .delete(protect, authorize("admin"), multipleDeleteOrder);
router
  .route("/:id")
  .get(getOrder)
  .put(protect, authorize("admin", "operator"), updateOrder);

module.exports = router;
