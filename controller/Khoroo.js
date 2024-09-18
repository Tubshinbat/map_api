const Khoroo = require("../models/Khoroo");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const fs = require("fs");

const paginate = require("../utils/paginate");
const { valueRequired } = require("../lib/check");
const {
  userSearch,
  RegexOptions,
  cityProvinceSearch,
  districtSearch,
} = require("../lib/searchOfterModel");
const { sortBuild, getModelPaths } = require("../lib/build");

// DEFUALT DATAS
const sortDefualt = { name: 1 };

exports.createKhoroo = asyncHandler(async (req, res) => {
  const userInput = req.body;
  const strFields = getModelPaths(Khoroo);
  req.body.createUser = req.userId;

  if (valueRequired(strFields))
    strFields.map((path) => {
      !valueRequired(userInput[path]) && delete req.body[path];
    });

  const result = await Khoroo.create(req.body);

  res.status(200).json({
    success: true,
    data: result,
  });
});

exports.searchKhoroo = asyncHandler(async (req, res) => {
  const results = await Khoroo.find({
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
  const datas = await Khoroo.find({})
    .populate("district")
    .populate("cityProvince")
    .sort(sortDefualt)
    .exec();

  if (!datas) throw new MyError("Өгөгдөл олдсонгүй", 404);

  res.status(200).json({
    success: true,
    data: datas,
  });
});

exports.getKhoroos = asyncHandler(async (req, res) => {
  const userInput = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  let sort = req.query.sort || sortDefualt;

  //  FIELDS
  const strFields = getModelPaths(Khoroo);
  const { createUser, updateUser, cityProvince, district, districtId, cityId } =
    userInput;

  const query = Khoroo.find();

  if (cityId) query.where("cityProvince", cityId);
  if (districtId) query.where("district", districtId);

  strFields.map((el) => {
    if (valueRequired(userInput[el]))
      query.find({ [el]: RegexOptions(userInput[el]) });
  });

  if (valueRequired(cityProvince)) {
    const result = await cityProvinceSearch(cityProvince);
    if (result) query.where("cityProvince").in(result);
  }

  if (valueRequired(district)) {
    const result = await districtSearch(district);
    if (result) query.where("district").in(result);
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

  query
    .populate("createUser")
    .populate("updateUser")
    .populate("district")
    .populate("cityProvince");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.countDocuments();

  const pagination = await paginate(page, limit, Khoroo, result);
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

exports.multDeleteKhoroo = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const finds = await Khoroo.find({ _id: { $in: ids } });

  if (finds.length <= 0) throw new MyError("Өгөгдөлүүд олдсонгүй", 404);

  await Khoroo.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.deleteKhoroo = asyncHandler(async (req, res) => {
  const item = await Khoroo.findByIdAndDelete(req.params.id);
  if (!item) throw new MyError("Өгөгдөл олдсонгүй.", 404);

  res.status(200).json({
    success: true,
  });
});

exports.getKhoroo = asyncHandler(async (req, res) => {
  const khoroo = await Khoroo.findByIdAndUpdate(req.params.id)
    .populate("createUser")
    .populate("updateUser")
    .populate("polygon")
    .populate("district")
    .populate("cityProvince");

  if (!khoroo) throw new MyError("Өгөгдөл олдсонгүй. ", 404);

  res.status(200).json({
    success: true,
    data: khoroo,
  });
});

exports.updateKhoroo = asyncHandler(async (req, res, next) => {
  let khoroo = await Khoroo.findById(req.params.id);
  if (!khoroo) throw new MyError("Өгөгдөл олдсонгүй. ", 404);

  const strFields = getModelPaths(Khoroo);

  if (valueRequired(strFields))
    strFields.map((path) => {
      if (!valueRequired(path)) req.body[path] = "";
    });

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  khoroo = await Khoroo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: khoroo,
  });
});

exports.getCountKhoroo = asyncHandler(async (req, res, next) => {
  const count = await Khoroo.countDocuments();

  res.status(200).json({
    success: true,
    count,
  });
});
