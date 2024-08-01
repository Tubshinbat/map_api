const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createRoom,
  getRooms,
  multDeleteRoom,
  getCountRoom,
  getRoom,
  updateRoom,
} = require("../controller/Room");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createRoom)
  .get(getRooms);

router.route("/delete").delete(protect, authorize("admin"), multDeleteRoom);
router.route("/count").get(getCountRoom);
router
  .route("/:id")
  .get(getRoom)
  .put(protect, authorize("admin", "operator"), updateRoom);

module.exports = router;
