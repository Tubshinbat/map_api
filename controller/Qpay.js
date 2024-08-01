const QpayUser = require("../models/QpayToken");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");

exports.createQpayUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await QpayUser.findOne();
  if (existingUser) {
    throw new MyError("Qpay хэрэглэгчийн тохиргоог хийсэн байна.", 400);
  }
  if (!username || !password) {
    throw new MyError("Хэрэглэгчийн нэр болон нууц үгийг оруулна уу", 400);
  }

  const qpayUser = await QpayUser.create({ username, password });

  res.status(200).json({
    success: true,
    data: qpayUser,
  });
});

exports.getQpayUser = asyncHandler(async (req, res) => {
  const existingUser = await QpayUser.findOne();
  if (!existingUser) {
    throw new MyError("Qpay хэрэглэгчийн тохиргоог хийгдээгүй байна.", 400);
  }

  res.status(200).json({
    success: true,
    data: existingUser,
  });
});

exports.updateQpayUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await QpayUser.findOne();
  if (!existingUser) {
    throw new MyError("Qpay хэрэглэгчийн тохиргоог оруулаагүй байна.", 404);
  }
  if (!username || !password) {
    throw new MyError("Хэрэглэгчийн нэр болон нууц үгийг оруулна уу", 400);
  }

  const qpayUser = await QpayUser.findOneAndUpdate(
    {},
    { username, password },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: qpayUser,
  });
});
