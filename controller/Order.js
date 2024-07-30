const Order = require("../models/Order");
const User = require("../models/User");
const Plan = require("../models/Plan");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
// const fs = require("fs");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

const { userSearch, RegexOptions } = require("../lib/searchOfterModel");

const { sortBuild, getModelPaths } = require("../lib/build");
const getCountDocuments = require("../utils/getCountDocuments");
const sortDefault = { createAt: -1 };

const updateMembershipDates = async (userId, planId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new MyError("Хэрэглэгч олдсонгүй", 404);
  }

  const plan = await Plan.findById(planId);

  if (!plan) {
    throw new MyError("Төлөвлөгөө олдсонгүй", 404);
  }

  const duration = plan.activeMonth;

  const currentDate = new Date();
  let startDate = user.startPlanDate || currentDate;
  let endDate = user.endPlanDate || currentDate;

  if (endDate < currentDate) {
    endDate = currentDate;
  }

  endDate.setMonth(endDate.getMonth() + duration);

  user.startPlanDate = startDate;
  user.endPlanDate = endDate;

  await user.save();
};

const generateOrderNumber = async () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const prefix = `O${year}${month}${day}`;

  const todayOrdersCount = await Order.countDocuments({
    orderNumber: new RegExp(`^${prefix}`),
  });
  const orderNumber = todayOrdersCount + 1;

  return `${prefix}${String(orderNumber).padStart(2, "0")}`;
};

exports.createOrder = asyncHandler(async (req, res) => {
  const { plan, status, paid, activedUser } = req.body;
  req.body.createUser = req.userId;
  req.body.status = valueRequired(req.body.status) || false;

  if ((req.body.status = true)) {
    await updateMembershipDates(req.body.activedUser, req.body.plan);
  }

  const order = new Order({ plan, status, paid, activedUser });
  order.orderNumber = await generateOrderNumber();
  await order.save();

  res.status(200).json({
    success: true,
    data: order,
    qpayInvoice: order.qpayInvoice,
  });
});

exports.createOrderWithQPay = asyncHandler(async (req, res) => {
  const { amount, description, plan, paid, activedUser, status } = req.body;

  // Order үүсгэх
  try {
    const order = new Order({
      status,
      amount,
      description,
      plan,
      paid,
      activedUser,
    });

    await order.save();
    res.status(201).json({
      success: true,
      order,
      qpayInvoice: order.qpayInvoice,
    });
  } catch (error) {}
});

exports.qpayCallback = asyncHandler(async (req, res) => {
  const { invoice_code, invoice_status } = req.body;

  // Төлбөрийн үр дүнг боловсруулах
  if (invoice_status === "PAID") {
    console.log(`Төлбөр амжилттай хийгдсэн: ${invoice_code}`);
    await Order.findOneAndUpdate(
      { orderNumber: invoice_code },
      { status: true }
    );
  } else {
    // Төлбөр амжилтгүй болсон үед хийх үйлдлүүд
    console.log(`Төлбөр амжилтгүй болсон: ${invoice_code}`);
    await Order.findOneAndUpdate(
      { orderNumber: invoice_code },
      { status: false }
    );
  }

  res.status(200).json({
    success: true,
    message: "Callback хүлээн авсан",
  });
});

exports.getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = sortDefault, ...filters } = req.query;
  const query = Order.find();

  await applyFilters(query, filters);

  query.sort(sortBuild(sort, sortDefault));
  query
    .populate("plan")
    .populate("createUser")
    .populate("updateUser")
    .populate("activedUser");

  const totalDocuments = await query.clone().countDocuments();
  const pagination = paginate(page, limit, Order, totalDocuments);

  query.limit(limit).skip(pagination.start - 1);
  const order = await query.exec();

  res.status(200).json({
    success: true,
    count: order.length,
    data: order,
    pagination,
  });
});

const applyFilters = async (query, filters) => {
  const strFields = getModelPaths(Order);

  strFields.forEach((field) => {
    if (valueRequired(filters[field])) {
      query.find({ [field]: RegexOptions(filters[field]) });
    }
  });

  if (valueRequired(filters.createUser)) {
    const userData = await userSearch(filters.createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(filters.updateUser)) {
    const userData = await userSearch(filters.updateUser);
    if (userData) query.where("updateUser").in(userData);
  }

  if (valueRequired(filters.status)) {
    const status = filters.status.split(",");
    query.where("status").in(status.length > 1 ? status : filters.status);
  }
};

exports.multipleDeleteOrder = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const findDatas = await Order.find({ _id: { $in: ids } });

  if (findDatas.length <= 0) {
    throw new MyError("Таны сонгосон мэдээнүүд олдсонгүй", 400);
  }

  await Order.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("plan")
    .populate("activedUser");

  if (!valueRequired(order)) throw new MyError("Тухайн өгөгдөл олсдонгүй", 404);

  res.status(200).json({
    success: true,
    data: order,
  });
});

exports.updateOrder = asyncHandler(async (req, res) => {
  const userInput = req.body;

  // Захиалгын өмнөх утгыг авах
  const existingOrder = await Order.findById(req.params.id);

  if (!existingOrder) throw new MyError("Тухайн захиалга олдсонгүй.", 404);

  const order = await Order.findByIdAndUpdate(req.params.id, userInput, {
    new: true,
    runValidators: true,
  });

  if (req.body.status === true && existingOrder.status === false) {
    await updateMembershipDates(req.userId, req.body.plan);
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

exports.getCountOrders = asyncHandler(async (req, res) => {
  const count = await getCountDocuments(Order);
  res.status(200).json({
    success: true,
    data: count,
  });
});
