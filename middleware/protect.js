const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");
const User = require("../models/User");

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization) {
    token = req.header.authorization.split(" ")[1];
  } else if (req.cookies) {
    token = req.cookies["webrtoken"];
  }
  if (!token) {
    throw new MyError("Уучлаарай хандах боломжгүй байна..", 400);
  }
  const tokenObject = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = tokenObject.id;
  req.userRole = tokenObject.role;
  next();
});

exports.protectUser = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization) {
    token = req.header.authorization.split(" ")[1];
  } else if (req.cookies) {
    token = req.cookies["seruuntoken"];
  }
  if (!token) {
    throw new MyError("Уучлаарай хандах боломжгүй байна..", 400);
  }

  const tokenObject = jwt.verify(token, process.env.JWT_SECRET);

  if (req.userId !== tokenObject.id)
    throw new MyError("Уучлаарай хандах боломжгүй байна...", 400);

  req.userId = tokenObject.id;
  req.userRole = tokenObject.role;
  next();
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      throw new MyError("Уучлаарай хандах эрхгүй байна.", 400);
    }
    next();
  };
};
