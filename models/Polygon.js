const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PolygonSchema = new Schema({
  type: {
    type: String,
    default: "Feature",
  },
  geometry: {
    type: {
      type: String,
      enum: ["Polygon", "MultiPolygon"],
      required: true,
    },
    coordinates: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  properties: {
    type: Schema.Types.Mixed,
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

PolygonSchema.index({ "geometry.coordinates": "2dsphere" });

const Polygon = mongoose.model("Polygon", PolygonSchema);

module.exports = Polygon;
