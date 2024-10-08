const express = require("express");
const router = express.Router();
const { protect, authorize, protectUser } = require("../middleware/protect");

const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  getCount,
  logout,
  login,
  deleteUser,
  multDeleteUsers,
  forgotPassword,
  verifyOTP,
  resetPassword,
  checklogin,
  changePassword,
  register,
} = require("../controller/Users");

router.route("/login").post(login);
router.route("/logout").get(protect, logout);
router.route("/forgot").post(forgotPassword);
router.route("/verifyotp").post(verifyOTP);
router.route("/resetpassword").post(resetPassword);
router.route("/checklogin").get(checklogin);
router.route("/register").post(register);

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createUser)
  .get(protect, authorize("admin", "operator"), getUsers);

router
  .route("/changepassword/:id")
  .put(protect, authorize("admin", "operator"), changePassword);

router.route("/count").get(protect, authorize("admin", "operator"), getCount);
router.route("/delete").delete(protect, authorize("admin"), multDeleteUsers);

router
  .route("/:id")
  .get(protect, authorize("admin", "operator"), getUser)
  .put(protect, authorize("admin", "operator"), updateUser)
  .delete(protect, authorize("admin"), deleteUser);

module.exports = router;
