const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QpayTokenSchema = new Schema({
  username: {
    type: String,
    trim: true,
  },

  password: {
    type: String,
    trim: true,
  },

  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  expiresIn: {
    type: Date,
    required: true,
  },
});

const Token = mongoose.model("QpayToken", QpayTokenSchema);

module.exports = Token;
