const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createBankAccount,
  getBankAccount,
  getBankAccounts,
  multDeleteBankAccount,
  updateBankAccount,
  getCountBankAccount,
} = require("../controller/BankAccount");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createBankAccount)
  .get(getBankAccounts);

router
  .route("/delete")
  .delete(protect, authorize("admin"), multDeleteBankAccount);
router
  .route("/:id")
  .get(getBankAccount)
  .put(protect, authorize("admin", "operator"), updateBankAccount);

router.route("/count").get(getCountBankAccount);

module.exports = router;
