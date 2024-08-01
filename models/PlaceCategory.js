const mongoose = require("mongoose");
const { slugify } = require("transliteration");
const Schema = mongoose.Schema;

const PlaceCategorySchema = new Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },
  name: {
    type: String,
    required: [true, "Газрын нэрийг оруулна уу"],
    minlength: [1, "Газрын нэр 1 - ээс үсэгнээс дээш үсэг оруулна уу"],
    trim: true,
  },
  icon: {
    type: String,
  },

  parentId: {
    type: String,
  },

  position: {
    type: Number,
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

PlaceCategorySchema.pre("update", function (next) {
  this.updateAt = Date.now;
  next();
});

module.exports = mongoose.model("PlaceCategory", PlaceCategorySchema);
