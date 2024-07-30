const mongoose = require("mongoose");

const WebInfoSchema = new mongoose.Schema({
  logo: { type: String, trim: true },
  whiteLogo: { type: String, trim: true },
  name: { type: String, trim: true },
  address: { type: String, trim: true },
  siteShortInfo: { type: String, trim: true },
  siteInfo: { type: String, trim: true },
  policy: { type: String, trim: true },
  phone: { type: [Number] },
  lat: { type: String },
  long: { type: String },
  email: {
    type: String,
    match: [
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      "Имэйл хаягаа буруу оруулсан байна",
    ],
  },
});

module.exports = mongoose.model("WebInfo", WebInfoSchema);
