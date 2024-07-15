const mongoose = require("mongoose");
const { slugify } = require("transliteration");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: [true, 'Захиалгын дугаар оруулна уу']
  },

  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  plan: {
    type: mongoose.Schema.ObjectId,
    ref: "Plan",
    required: [true, 'Багцаас сонгоно уу']
  },

  paid: {
    type: String,
    enum: ["qpay", "bank", "trial", "none"],
    required: [true, "Төлбөр төлсөн хэрэгсэлийг сонгоно уу"],
  },

  activedAt: {
    type: Date,
    default: null
  },

  activedUser: {
    type: mongoose.Schema.ObjectId,
    ref:"User"
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


OrderSchema.pre("save", function (next) {
    this.updateAt = Date.now();
    next();
  });
  
  // update хийхийн өмнө updateAt талбарыг шинэчлэх middleware
  OrderSchema.pre("findOneAndUpdate", function (next) {
    this.set({ updateAt: Date.now() });
    next();
  });

  // Төлбөр хийгдэх үед activatedAt талбарыг шинэчлэх middleware
OrderSchema.pre("save", function (next) {
    if (this.isModified('paid') && this.paid !== 'none') {
      this.activatedAt = Date.now();
    }
    next();
  });

module.exports = mongoose.model("Order", OrderSchema);
