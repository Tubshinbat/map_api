const WebInfo = require("../models/WebInfo");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");

// UTILS
const { getModelPaths } = require("../lib/build");
const { valueRequired } = require("../lib/check");

// DEFUALT DATAS
const sortDefault = { createAt: -1 };

exports.createWebInfo = asyncHandler(async (req, res, next) => {
  const userInput = req.body;
  const strFields = getModelPaths(WebInfo);

  if (valueRequired(strFields)) {
    strFields.map((path) => {
      if (!valueRequired(userInput[path])) delete req.body[path];
    });
  }

  const webinfo = await WebInfo.create(req.body);

  res.status(200).json({
    success: true,
    data: webinfo,
  });
});

exports.getWebInfo = asyncHandler(async (req, res) => {
  const webInfo = await WebInfo.findOne({}).sort(sortDefault).exec();

  if (!webInfo) {
    throw new MyError("Вебийн мэдээлэл олдсонгүй", 404);
  }

  res.status(200).json({
    success: true,
    data: webInfo,
  });
});

exports.updateWebInfo = asyncHandler(async (req, res) => {
  const existingWebInfo = await WebInfo.findOne({}).sort(sortDefault).exec();

  if (!existingWebInfo) {
    throw new MyError("Вебийн мэдээлэл олдсонгүй", 404);
  }

  const webInfo = await WebInfo.findByIdAndUpdate(
    existingWebInfo._id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: webInfo,
  });
});
