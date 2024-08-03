const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  name: {
    type: String,
    required: [true, "Гэр, Байшин, Өрөөний нэрийг оруулна уу"],
    trim: true,
  },

  pictures: {
    type: [String],
    defualt: "no-photo.jpg",
  },

  shortAbout: {
    type: String,
    trim: true,
  },

  details: {
    type: String,
  },

  price: {
    type: Number,
    trim: true,
  },

  bed: {
    type: Number,
    trim: true,
    required: [true, "Орны тоо оруулна уу"],
  },

  human: {
    type: Number,
    trim: true,
    required: [true, "Хүн орох багтаамжийг оруулна уу"],
  },

  place: {
    type: mongoose.Schema.ObjectId,
    ref: "Place",
    required: [true, "Газар сонгоно уу"],
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

module.exports = mongoose.model("Room", RoomSchema);
