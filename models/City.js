const mongoose = require("mongoose");
const { slugify } = require("transliteration");
const Schema = mongoose.Schema;

const CitySchema = new Schema({
  name: {
    type: String,
    required: [true, "Хот/аймгийн нэрийг оруулна уу"],
    trim: true,
  },

  engName: {
    type: String,
    required: [true, "Хот/аймгийн Англи нэрийг оруулна уу"],
    trim: true,
  },

  polygon: {
    type: mongoose.Schema.ObjectId,
    ref: "Polygon",
  },

  position: {
    type: Number,
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

module.exports = mongoose.model("City", CitySchema);
