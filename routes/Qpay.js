const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const { createOrderWithQPay } = require("../controller/Order");

router.route("/").post(protect, createOrderWithQPay);

router.route("/callback").get(getSlugSingleNews);

router.route("/count").get(getCountNews);

router
  .route("/delete")
  .delete(protect, authorize("admin"), multipleDeleteOrder);
router
  .route("/:id")
  .get(getSingleNews)
  .put(protect, authorize("admin", "operator"), updateNews);

module.exports = router;
