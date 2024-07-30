const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const { createOrderWithQPay, qpayCallback } = require("../controller/Order");
const {
  createQpayUser,
  getQpayUser,
  updateQpayUser,
} = require("../controller/Qpay");
router.route("/").post(protect, createOrderWithQPay);
router.route("/callback").get(qpayCallback);

router.route("/createuser").post(protect, authorize("admin"), createQpayUser);
router
  .route("/updateuser")
  .put(protect, authorize("admin", "operator"), updateQpayUser);
router
  .route("/getuser")
  .get(protect, authorize("admin", "operator"), getQpayUser);
module.exports = router;
