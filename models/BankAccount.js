const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BankAccountSchemma = new Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  bankLogo: {
    type: String,
    default: null,
  },

  bankName: {
    type: String,
    required: [true, "Банкны нэр оруулна уу"],
  },

  accountName: {
    type: String,
    required: [true, "Данс эзэмшигчийн нэр"],
  },

  accountNumber: {
    type: Number,
    required: [true, "Банкны дансны дугаараа оруулна уу"],
  },

  createAt: {
    type: Date,
    default: Date.now,
  },

  updateAt: {
    type: Date,
    default: Date.now,
  },

  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },

  updateUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

BankAccountSchemma.pre("update", function (next) {
  this.updateAt = Date.now;
  next();
});

module.exports = mongoose.model("BankAccount", BankAccountSchemma);
