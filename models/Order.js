const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { createQPayInvoice } = require("../service/qpay");

// Захиалгын дугаар үүсгэх функц
const generateOrderNumber = async () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const prefix = `O${year}${month}${day}`;

  const todayOrdersCount = await mongoose.model("Order").countDocuments({
    orderNumber: new RegExp(`^${prefix}`),
  });
  const orderNumber = todayOrdersCount + 1;

  return `${prefix}${String(orderNumber).padStart(2, "0")}`;
};

const OrderSchema = new Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: [true, "Захиалгын дугаар оруулна уу"],
  },

  status: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  plan: {
    type: mongoose.Schema.ObjectId,
    ref: "Plan",
    required: [true, "Багцаас сонгоно уу"],
  },

  paid: {
    type: String,
    enum: ["qpay", "bank", "none"],
    required: [true, "Төлбөр төлсөн хэрэгсэлийг сонгоно уу"],
    default: "none",
  },

  activatedAt: {
    type: Date,
    default: null,
  },

  activedUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },

  qpayInvoice: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
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

OrderSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.orderNumber = await generateOrderNumber();
  }
  this.updatedAt = Date.now();

  if (this.isModified("paid") && this.paid === "qpay") {
    try {
      const qpayInvoice = await createQPayInvoice(this);
      this.qpayInvoice = qpayInvoice;
    } catch (error) {
      return next(error);
    }
  }

  next();
});

OrderSchema.pre("save", async function (next) {
  this.orderNumber = await generateOrderNumber();

  this.updatedAt = Date.now();

  if (this.isModified("paid") && this.paid === "qpay") {
    try {
      const qpayInvoice = await createQPayInvoice(this);
      this.qpayInvoice = qpayInvoice; // QPay invoice мэдээллийг хадгалах

      // QR кодын холбоосыг олох
      const qrLink = qpayInvoice.links.find((link) => link.rel === "qr_code");
      if (qrLink) {
        this.qpayInvoice.qr_image = qrLink.href;
      }
    } catch (error) {
      return next(error); // Алдаа гарсан тохиолдолд next(error) ашиглан middleware-г зогсоох
    }
  }

  next();
});

OrderSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

OrderSchema.pre("save", function (next) {
  if (this.isModified("paid") && this.paid !== "none" && this.status == true) {
    this.activatedAt = Date.now();
  }
  next();
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
