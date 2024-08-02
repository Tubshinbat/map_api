const Place = require("../models/Place");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");

const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const {
  userSearch,
  placeCategorySearch,
  RegexOptions,
} = require("../lib/searchOfterModel");
const { sortBuild, getModelPaths } = require("../lib/build");
const { slugify } = require("transliteration");

// DEFUALT DATAS
const sortDefualt = { createAt: -1 };

exports.createPlace = asyncHandler(async (req, res) => {
  const userInput = req.body;
  const strFields = getModelPaths(Place);
  req.body.status = userInput["status"] || true;
  req.body.createUser = req.userId;

  const name = req.body.name;

  const uniqueName = await Place.find({ name });

  if (Array.isArray(uniqueName) && uniqueName.length > 0) {
    const countSlug = uniqueName.length + 1;
    req.body.slug = slugify(req.body.name) + "_" + countSlug;
  } else req.body.slug = slugify(req.body.name);

  if (valueRequired(strFields))
    strFields.map((path) => {
      !valueRequired(userInput[path]) && delete req.body[path];
    });

  if (userInput["services"]) {
    req.body.services = JSON.parse(userInput["services"]);
  }

  const place = await Place.create(req.body);
  res.status(200).json({
    success: true,
    data: place,
  });
});

exports.getPlaces = asyncHandler(async (req, res) => {
  const userInput = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  let sort = req.query.sort || sortDefualt;

  //  FIELDS
  const strFields = getModelPaths(Place);
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];
  const status = userInput["status"];
  const star = userInput['star']
  const categories = userInput["categories"];

  const query = Place.find();

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

  if(valueRequired(star)){
    if (star.split(",").length > 1)
      query.where("star").in(star.split(","));
    else query.where("star").equals(star);
  }

  if (valueRequired(categories)) {
    const ids = await placeCategorySearch(categories);
    if (ids.length > 0) query.where("categories").in(ids);
  }

  if (valueRequired(sort)) query.sort(sortBuild(sort, sortDefualt));

  query.populate("createUser");
  query.populate("updateUser");
  query.populate("categories");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.countDocuments();

  const pagination = await paginate(page, limit, Place, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const datas = await query.exec();

  res.status(200).json({
    success: true,
    count: datas.length,
    data: datas,
    pagination,
  });
});

exports.multDeletePlace = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const finds = await Place.find({ _id: { $in: ids } });

  if (finds.length <= 0) throw new MyError("Өгөгдөлүүд олдсонгүй", 404);

  finds.map(async (el) => {
    el.pictures &&
      el.pictures.map(async (picture) => await imageDelete(picture));
    el.logo && (await imageDelete(el.logo));
  });

  await Place.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.deletePlace = asyncHandler(async (req, res) => {
  const item = await Place.findByIdAndDelete(req.params.id);
  if (!item) throw new MyError("Өгөгдөл олдсонгүй.", 404);

  item.pictures &&
    item.pictures.map(async (picture) => await imageDelete(picture));
  item.logo && (await imageDelete(item.logo));

  res.status(200).json({
    success: true,
  });
});

exports.getPlace = asyncHandler(async (req, res) => {
  const place = await Place.findByIdAndUpdate(req.params.id)
    .populate("categories")
    .populate("createUser")
    .populate("updateUser");

  if (!place) throw new MyError("Өгөгдөл олдсонгүй. ", 404);

  const views = place.views + 1;
  await Place.findByIdAndUpdate(req.params.id, { views: views });

  const strFields = getModelPaths(Place);
  // if (process.env.LANGUAGE == "TRUE") {
  //   const language = req.cookies.language || null;

  //   strFields.map((path) => {
  //     if (valueRequired(banner.language[language])) {
  //       banner[path] = banner.language[language][path];
  //     } else {
  //       banner[path] = "";
  //     }
  //   });
  // }

  res.status(200).json({
    success: true,
    data: place,
  });
});

exports.updatePlace = asyncHandler(async (req, res, next) => {
  let place = await Place.findById(req.params.id);
  if (!place) throw new MyError("Өгөгдөл олдсонгүй. ", 404);

  const userInput = req.body;
  const strFields = getModelPaths(Place);

  const uniqueName = await Place.find({ name });

  if (Array.isArray(uniqueName) && uniqueName.length > 1) {
    const countSlug = uniqueName.length + 1;
    req.body.slug = slugify(req.body.name) + "_" + countSlug;
  } else req.body.slug = slugify(req.body.name);

  if (valueRequired(strFields))
    strFields.map((path) => {
      if (!valueRequired(path)) req.body[path] = "";
    });

  if (userInput["services"])
    req.body.services = JSON.parse(userInput["services"]);
  else req.body.services = [];

  if (!userInput["logo"]) req.body.logo = "";
  if (!userInput["categories"]) req.body.categories = [];
  if (!userInput["pictures"]) req.body.pictures = [];

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  place = await Place.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: place,
  });
});

exports.getCountPlace = asyncHandler(async (req, res, next) => {
  const count = await Place.countDocuments();

  res.status(200).json({
    success: true,
    count,
  });
});
