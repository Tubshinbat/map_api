const mongoose = require("mongoose");
const { slugify } = require("transliteration");
const Schema = mongoose.Schema;

const KhorooSchema = new Schema({
  name: {
    type: String,
    required: [true, "Сум/дүүргийн нэрийг оруулна уу"],
    trim: true,
  },

  engName: {
    type: String,
    required: [true, "Сум/дүүргийн Англи нэрийг оруулна уу"],
    trim: true,
  },

  cityProvince: {
    type: mongoose.Schema.ObjectId,
    ref: "City",
    required: [true, "Заавал хот/аймагаас сонгоно уу"],
  },

  district: {
    type: mongoose.Schema.ObjectId,
    ref: "District",
    required: [true, "Заамв сум / дүүргээс сонгоно уу"],
  },

  polygon: {
    type: mongoose.Schema.ObjectId,
    ref: "Polygon",
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

module.exports = mongoose.model("Khoroo", KhorooSchema);
