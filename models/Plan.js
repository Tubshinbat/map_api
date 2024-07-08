const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PlanSchema = new Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },
  name: {
    type: String,
    required: [true, "Төлбөрийн багцын нэрийг оруулна уу"],
    trim: true,
  },

  activeMonth: {
    type: Number,
    required: [true, "Идэвхтэй сарыг оруулна уу"],
    trim: true,
  },

  price: {
    type: Number,
    required: [true, "Төлөх дүнийг оруулна уу"],
    trim: true,
  },

  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },

  updateUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },

  createAt: {
    type: Date,
    default: Date.now,
  },

  updateAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Plan", PlanSchema);
