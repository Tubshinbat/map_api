const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const NewsCategoriesSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  name: {
    type: String,
  },

  slug: {
    type: String,
  },

  parentId: {
    type: String,
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

module.exports = mongoose.model("NewsCategories", NewsCategoriesSchema);
