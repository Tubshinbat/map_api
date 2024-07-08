const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createPlan,
  getPlans,
  getPlan,
  multDeletePlan,
  updatePlan,
  getCountPlan,
} = require("../controller/Plan");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createPlan)
  .get(getPlans);

router.route("/count").get(getCountPlan);
router.route("/delete").delete(protect, authorize("admin"), multDeletePlan);

router
  .route("/:id")
  .get(getPlan)
  .put(protect, authorize("admin", "operator"), updatePlan);

module.exports = router;
