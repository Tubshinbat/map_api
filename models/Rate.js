const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RateSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },
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

  pictures: {
    type: [String],
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

module.exports = mongoose.model("Rate", RateSchema);
