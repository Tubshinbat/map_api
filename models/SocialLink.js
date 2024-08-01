const mongoose = require("mongoose");

const SocialLinksSchema = new mongoose.Schema({
  icon: {
    type: String,
    required: [true, "Дүрс сонгоно уу"],
  },

  name: {
    type: String,
    trim: true,
    required: [true, "Сошиал сувгийн нэр"],
  },

  link: {
    type: String,
    trim: true,
    required: [true, "Сошиал сувгийн холбоос"],
  },

  createAt: {
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
  updateAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SocialLink", SocialLinksSchema);
