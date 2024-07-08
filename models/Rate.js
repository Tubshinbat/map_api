const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RateSchema = new mongoose.Schema({
  place: {
    type: mongoose.Schema.ObjectId,
    ref: "Place",
  },

  rate: {
    type: Number,
    required: [true, "Үнэлгээ оруулна уу"],
    trim: true,
  },

  comment: {
    type: String,
    trim: true,
    required: [true, "Сэтгэгдэл үлдээнэ үү"],
    minlength: [10, "10 -аас дээш үсэгний тоо байх ёстой"],
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

module.exports = mongoose.model("Rate", RateSchema);
