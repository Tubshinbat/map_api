const mongoose = require("mongoose");
const { slugify } = require("transliteration");
const Schema = mongoose.Schema;

const PlaceSchema = new Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  star: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  name: {
    type: String,
    trim: true,
    required: [true, "Хаяг байршилын нэрийг оруулна уу"],
  },

  pictures: {
    type: [String],
    trim: true,
  },

  logo: {
    type: String,
    trim: true,
  },

  about: {
    type: String,
    trim: true,
  },

  services: {
    type: [Object],
  },

  addressText: {
    type: String,
    trim: true,
  },

  address_kh: {
    type: String,
    trim: true,
  },

  address_st: {
    type: String,
    trim: true,
  },

  address_ne: {
    type: String,
    trim: true,
  },

  lat: {
    type: String,
    trim: true,
    required: [true, "Уртраг өргөрөг заавал оруулна уу"],
  },

  long: {
    type: String,
    trim: true,
    required: [true, "Уртраг өргөрөг заавал оруулна уу"],
  },

  categories: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "PlaceCategory",
    },
  ],

  views: {
    type: Number,
    default: 0,
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

module.exports = mongoose.model("Place", PlaceSchema);
