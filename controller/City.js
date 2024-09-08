const City = require("../models/City");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const fs = require("fs");

const paginate = require("../utils/paginate");
const { valueRequired } = require("../lib/check");
const { userSearch, RegexOptions } = require("../lib/searchOfterModel");
const { sortBuild, getModelPaths } = require("../lib/build");

// DEFUALT DATAS
const sortDefualt = { position: 1 };

exports.createCity = asyncHandler(async (req, res) => {
  const userInput = req.body;
  const strFields = getModelPaths(City);
  req.body.createUser = req.userId;
  let position = 0;

  const city = await City.findOne({}).sort({ position: -1 });
  if (city) position = city.position + 1;
  req.body.position = position;

  if (valueRequired(strFields))
    strFields.map((path) => {
      !valueRequired(userInput[path]) && delete req.body[path];
    });

  const result = await City.create(req.body);

  res.status(200).json({
    success: true,
    data: result,
  });
});

exports.searchCity = asyncHandler(async (req, res) => {
  const results = await City.find({
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
  const datas = await City.find({})
    .populate("polygon")
    .sort(sortDefualt)
    .exec();

  if (!datas) throw new MyError("Өгөгдөл олдсонгүй", 404);

  res.status(200).json({
    success: true,
    data: datas,
  });
});

exports.changePosition = asyncHandler(async (req, res) => {
  const datas = req.body.data;
  if (!datas)
    throw new MyError("Өгөгдөл ирсэнгүй дахин шалгаад явуулна уу", 402);

  const positionChange = (listData, pKey = null) => {
    if (listData) {
      listData.map(async (el, index) => {
        const data = {
          position: index,
        };
        await City.findByIdAndUpdate(el.key, data);
      });
    }
  };

  positionChange(datas);

  res.status(200).json({
    success: true,
  });
});

exports.getCitys = asyncHandler(async (req, res) => {
  const userInput = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;

  let sort = req.query.sort || sortDefualt;

  //  FIELDS
  const strFields = getModelPaths(City);
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];

  const query = City.find();

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

  if (valueRequired(sort)) query.sort(sortBuild(sort, sortDefualt));

  query.populate("createUser").populate("updateUser").populate("polygon");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.countDocuments();

  const pagination = await paginate(page, limit, City, result);
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

exports.multDeleteCity = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const finds = await City.find({ _id: { $in: ids } });

  if (finds.length <= 0) throw new MyError("Өгөгдөлүүд олдсонгүй", 404);

  await City.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.deleteCity = asyncHandler(async (req, res) => {
  const item = await City.findByIdAndDelete(req.params.id);
  if (!item) throw new MyError("Өгөгдөл олдсонгүй.", 404);

  res.status(200).json({
    success: true,
  });
});

exports.getCity = asyncHandler(async (req, res) => {
  const city = await City.findByIdAndUpdate(req.params.id)
    .populate("createUser")
    .populate("updateUser")
    .populate("polygon");

  if (!city) throw new MyError("Өгөгдөл олдсонгүй. ", 404);

  res.status(200).json({
    success: true,
    data: city,
  });
});

exports.updateCity = asyncHandler(async (req, res, next) => {
  let city = await City.findById(req.params.id);
  if (!city) throw new MyError("Өгөгдөл олдсонгүй. ", 404);

  const strFields = getModelPaths(City);

  if (valueRequired(strFields))
    strFields.map((path) => {
      if (!valueRequired(path)) req.body[path] = "";
    });

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  city = await City.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: city,
  });
});

exports.getCountCity = asyncHandler(async (req, res, next) => {
  const count = await City.countDocuments();

  res.status(200).json({
    success: true,
    count,
  });
});
