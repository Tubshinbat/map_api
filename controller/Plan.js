const Plan = require("../models/Plan");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const Language = require("../models/Language");

const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { userSearch, RegexOptions } = require("../lib/searchOfterModel");
const { sortBuild, getModelPaths } = require("../lib/build");
const { buildLanguage, buildUpdateLanguage } = require("../lib/language");

// DEFUALT DATAS
const sortDefualt = { price: -1 };

exports.createPlan = asyncHandler(async (req, res) => {
  const userInput = req.body;
  const strFields = getModelPaths(Plan);
  req.body.status = userInput["status"] || true;
  req.body.createUser = req.userId;

  if (valueRequired(strFields))
    strFields.map((path) => {
      !valueRequired(userInput[path]) && delete req.body[path];
    });

  const plan = await Plan.create(req.body);
  res.status(200).json({
    success: true,
    data: plan,
  });
});

exports.getPlans = asyncHandler(async (req, res) => {
  const userInput = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || sortDefualt;

  //  FIELDS
  const strFields = getModelPaths(Plan);
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];
  const status = userInput["status"];

  const query = Plan.find();

  strFields.map((el) => {
    if (valueRequired(userInput[el]))
      query.find({ [el]: RegexOptions(userInput[el]) });
  });

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
  }

  if (valueRequired(status)) {
    if (status.split(",").length > 1)
      query.where("status").in(status.split(","));
    else query.where("status").equals(status);
  }

  if (valueRequired(sort)) query.sort(sortBuild(sort, sortDefualt));

  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.countDocuments();

  const pagination = await paginate(page, limit, Plan, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const plans = await query.exec();

  res.status(200).json({
    success: true,
    count: plans.length,
    data: plans,
    pagination,
  });
});

exports.multDeletePlan = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const finds = await Plan.find({ _id: { $in: ids } });

  if (finds.length <= 0) throw new MyError("Өгөгдөлүүд олдсонгүй", 404);

  await Plan.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.deletePlan = asyncHandler(async (req, res) => {
  const item = await Plan.findByIdAndDelete(req.params.id);
  if (!item) throw new MyError("Өгөгдөл олдсонгүй.", 404);

  res.status(200).json({
    success: true,
  });
});

exports.getPlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id)
    .populate("createUser")
    .populate("updateUser");

  if (!plan) throw new MyError("Өгөгдөл олдсонгүй. ", 404);

  res.status(200).json({
    success: true,
    data: plan,
  });
});

exports.updatePlan = asyncHandler(async (req, res, next) => {
  let plan = await Plan.findById(req.params.id);
  if (!plan) throw new MyError("Өгөгдөл олдсонгүй. ", 404);

  const userInput = req.body;
  const strFields = getModelPaths(Plan);

  if (valueRequired(strFields))
    strFields.map((path) => {
      if (!valueRequired(path)) req.body[path] = "";
    });

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: plan,
  });
});

exports.getCountPlan = asyncHandler(async (req, res, next) => {
  const plan = await Plan.countDocuments();
  res.status(200).json({
    success: true,
    data: plan,
  });
});
