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

  isAddress: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  name: {
    type: String,
    trim: true,
    required: [true, "Хаяг байршилын нэрийг оруулна уу"],
  },

  engName: {
    type: String,
    trim: true,
    required: [true, "Хаяг байршилын Англи хэл дээр нэрийг оруулна уу"],
  },

  slug: { type: String },

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

  vicinity: {
    type: String,
    trim: true,
  },

  addressText: {
    type: [String],
    trim: true,
  },

  cityProvince: {
    type: mongoose.Schema.ObjectId,
    ref: "City",
    default: null,
    required: false,
  },

  district: {
    type: mongoose.Schema.ObjectId,
    ref: "District",
    default: null,
    required: false,
  },

  khoroo: {
    type: mongoose.Schema.ObjectId,
    ref: "Khoroo",
    default: null,
    required: false,
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

  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
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

// 2dsphere индекс үүсгэх
PlaceSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Place", PlaceSchema);
