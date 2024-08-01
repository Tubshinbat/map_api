const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema({
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

  slug: String,

  name: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },

  details: {
    type: String,
    trim: true,
  },

  pictures: {
    type: [String],
  },

  categories: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "NewsCategories",
    },
  ],

  views: {
    type: Number,
    default: 0,
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

module.exports = mongoose.model("News", NewsSchema);
