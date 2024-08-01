const mongoose = require("mongoose");
const { slugify } = require("transliteration");
const Schema = mongoose.Schema;

const BannerSchema = new Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  type: {
    type: String,
    enum: ["photo", "video"],
    default: "photo",
  },

  name: {
    type: String,
    trim: true,
  },

  details: {
    type: String,
    maxlength: [350, "Баннерын тайлбар 350 - аас дээш оруулах боломжгүй"],
  },

  picture: {
    type: String,
  },

  video: {
    type: String,
  },

  link: {
    type: String,
  },

  language: Schema.Types.Mixed,

  createAt: {
    type: Date,
    default: Date.now,
  },

  updateAt: {
    type: Date,
    default: Date.now,
  },

  //   createUser: {
  //     type: mongoose.Schema.ObjectId,
  //     ref: "User",
  //   },

  //   updateUser: {
  //     type: mongoose.Schema.ObjectId,
  //     ref: "User",
  //   },
});

BannerSchema.pre("update", function (next) {
  this.updateAt = Date.now;
  next();
});

module.exports = mongoose.model("Banner", BannerSchema);
