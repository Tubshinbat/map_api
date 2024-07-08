const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createRate,
  getRates,
  getCountRate,
  multDeleteRate,
  getRate,
} = require("../controller/Rate");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createRate)
  .get(getRates);

router.route("/delete").delete(protect, authorize("admin"), multDeleteRate);
router.route("/count").get(getCountRate);
router.route("/:id").get(getRate);

module.exports = router;
