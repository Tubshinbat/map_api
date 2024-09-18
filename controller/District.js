const District = require("../models/District");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const fs = require("fs");

const paginate = require("../utils/paginate");
const { valueRequired } = require("../lib/check");
const {
  userSearch,
  RegexOptions,
  cityProvinceSearch,
} = require("../lib/searchOfterModel");
const { sortBuild, getModelPaths } = require("../lib/build");

// DEFUALT DATAS
const sortDefualt = { name: -1 };

exports.createDistrict = asyncHandler(async (req, res) => {
  const userInput = req.body;
  const strFields = getModelPaths(District);
  req.body.createUser = req.userId;

  if (valueRequired(strFields))
    strFields.map((path) => {
      !valueRequired(userInput[path]) && delete req.body[path];
    });

  const result = await District.create(req.body);

  res.status(200).json({
    success: true,
    data: result,
  });
});

exports.searchDistrict = asyncHandler(async (req, res) => {
  const results = await District.find({
    $or: [
      { name: new RegExp(query, "i") },
      { engName: new RegExp(query, "i") },
    ],
  });
  const { query } = req.query;

  res.status(200).json({
    success: true,
    data: results,
  });
});

exports.getAllData = asyncHandler(async (req, res) => {
  const datas = await District.find({})
    .populate("polygon")
    .populate("cityProvince")
    .sort(sortDefualt)
    .exec();

  if (!datas) throw new MyError("Өгөгдөл олдсонгүй", 404);

  res.status(200).json({
    success: true,
    data: datas,
  });
});

exports.getDistricts = asyncHandler(async (req, res) => {
  const userInput = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  let sort = req.query.sort || sortDefualt;

  //  FIELDS
  const strFields = getModelPaths(District);
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];
  const cityProvince = userInput["cityProvince"];
  const cityId = userInput["cityId"];

  const query = District.find();

  strFields.map((el) => {
    if (valueRequired(userInput[el]))
      query.find({ [el]: RegexOptions(userInput[el]) });
  });

  if (valueRequired(cityId)) {
    query.where("cityProvince").in(cityId);
  }
  if (valueRequired(cityProvince)) {
    const result = await cityProvinceSearch(cityProvince);
    if (result) query.where("cityProvince").in(result);
  }

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
  }

  if (valueRequired(sort)) query.sort(sortBuild(sort, sortDefualt));

  query.populate("createUser").populate("updateUser").populate("cityProvince");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.countDocuments();

  const pagination = await paginate(page, limit, District, result);
  if (!req.query.all) {
    query.limit(limit);
    query.skip(pagination.start - 1);
  }
  const datas = await query.exec();

  res.status(200).json({
    success: true,
    count: datas.length,
    data: datas,
    pagination,
  });
});

exports.multDeleteDistrict = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const finds = await District.find({ _id: { $in: ids } });

  if (finds.length <= 0) throw new MyError("Өгөгдөлүүд олдсонгүй", 404);

  await District.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.deleteDistrict = asyncHandler(async (req, res) => {
  const item = await District.findByIdAndDelete(req.params.id);
  if (!item) throw new MyError("Өгөгдөл олдсонгүй.", 404);

  res.status(200).json({
    success: true,
  });
});

exports.getDistrict = asyncHandler(async (req, res) => {
  const district = await District.findByIdAndUpdate(req.params.id)
    .populate("createUser")
    .populate("updateUser")
    .populate("polygon")
    .populate("cityProvince");

  if (!district) throw new MyError("Өгөгдөл олдсонгүй. ", 404);

  res.status(200).json({
    success: true,
    data: district,
  });
});

exports.updateDistrict = asyncHandler(async (req, res, next) => {
  let district = await District.findById(req.params.id);
  if (!district) throw new MyError("Өгөгдөл олдсонгүй. ", 404);

  const strFields = getModelPaths(District);

  if (valueRequired(strFields))
    strFields.map((path) => {
      if (!valueRequired(path)) req.body[path] = "";
    });

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  district = await District.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: district,
  });
});

exports.getCountDistrict = asyncHandler(async (req, res, next) => {
  const count = await District.countDocuments();

  res.status(200).json({
    success: true,
    count,
  });
});
