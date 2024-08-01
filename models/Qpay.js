const mongoose = require("mongoose");

const QpaySchema = new mongoose.Schema({
  token_type: {
    type: String,
  },
  refresh_expires_in: {
    type: Number,
  },
  refresh_token: {
    type: String,
  },
  access_token: {
    type: String,
  },
  expires_in: {
    type: Number,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Qpay", QpaySchema);
