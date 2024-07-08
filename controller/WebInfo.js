const WebInfo = require("../models/WebInfo");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");

// UTILS
const { getModelPaths } = require("../lib/build");
const { valueRequired } = require("../lib/check");

// DEFUALT DATAS
const sortDefualt = { createAt: -1 };

exports.createWebInfo = asyncHandler(async (req, res, next) => {
  const userInput = req.body;
  const strFields = getModelPaths(WebInfo);

  if (valueRequired(strFields))
    strFields.map((path) => {
      !valueRequired(userInput[path]) && delete req.body[path];
    });

  const webinfo = await WebInfo.create(req.body);

  res.status(200).json({
    success: true,
    data: webinfo,
  });
});

exports.getWebInfo = asyncHandler(async (req, res) => {
  const query = WebInfo.findOne({}).sort(sortDefualt);
  const webInfo = await query.exec();

  res.status(200).json({
    success: true,
    data: webInfo,
  });
});

exports.updateWebInfo = asyncHandler(async (req, res) => {
  const data = await WebInfo.findOne({}).sort(sortDefualt);
  const webInfo = await WebInfo.findByIdAndUpdate(data._id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: webInfo,
  });
});
