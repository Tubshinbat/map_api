const Place = require("../models/Place");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const shapefile = require("shapefile");
const path = require("path");
const fs = require("fs");
const iconv = require("iconv-lite");

const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const {
  userSearch,
  placeCategorySearch,
  RegexOptions,
  cityProvinceSearch,
  districtSearch,
  khorooSearch,
} = require("../lib/searchOfterModel");
const { sortBuild, getModelPaths } = require("../lib/build");
const { slugify } = require("transliteration");
const PlaceCategory = require("../models/PlaceCategory");

// DEFUALT DATAS
const sortDefualt = { createAt: -1 };

exports.placeSearch = asyncHandler(async (req, res) => {
  try {
    const { query } = req.query; // Товчоор хэлбэл хайлт хийх утгууд

    const searchQuery = {
      $or: [
        { address_ne: new RegExp(query, "i") },
        { address_st: new RegExp(query, "i") },
        { address_kh: new RegExp(query, "i") },
        { addressText: new RegExp(query, "i") },
        { name: new RegExp(query, "i") },
        { engName: new RegExp(query, "i") },
      ],
    };

    const results = await Place.find(searchQuery).populate("categories");

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

exports.coordinateSearch = asyncHandler(async (req, res) => {
  const { location, radius } = req.query;

  if (!location) {
    throw new MyError("Байршлын координатыг оруулна уу", 400);
  }

  const coordinate = location.split(",");
  const lat = parseFloat(coordinate[0]);
  const lng = parseFloat(coordinate[1]);

  if (isNaN(lat) || isNaN(lng)) {
    throw new MyError("Уртраг, өргөргийн утгыг зөв форматтай оруулна уу", 400);
  }

  const maxRadius = radius ? parseInt(radius, 10) : 50;

  const place = await Place.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: maxRadius,
      },
    },
  })
    .populate("cityProvince")
    .populate("district")
    .populate("khoroo");

  res.status(200).json({
    success: true,
    data: place,
  });
});

exports.createPlace = asyncHandler(async (req, res) => {
  const userInput = req.body;
  const strFields = getModelPaths(Place);
  req.body.status = userInput["status"] || true;
  req.body.createUser = req.userId;
  const name = req.body.name;

  const { type, coordinates, cityProvince, district, khoroo } = req.body;

  req.body.location = {
    type,
    coordinates,
  };

  if (!valueRequired(cityProvince)) req.body.cityProvince = null;
  if (!valueRequired(district)) req.body.district = null;
  if (!valueRequired(khoroo)) req.body.khoroo = null;

  console.log(req.body);

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

exports.searchPlace = asyncHandler(async (req, res) => {
  try {
    const { query } = req.query;

    const searchQuery = {
      $or: [
        { address_ne: new RegExp(query, "i") },
        { address_st: new RegExp(query, "i") },
        { address_kh: new RegExp(query, "i") },
        { addressText: new RegExp(query, "i") },
        { name: new RegExp(query, "i") },
      ],
    };

    const results = await Place.find(searchQuery);

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

exports.getPlaces = asyncHandler(async (req, res) => {
  const userInput = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  let sort = req.query.sort || sortDefualt;

  //  FIELDS
  const strFields = getModelPaths(Place);
  const {
    createUser,
    updateUser,
    status,
    star,
    categories,
    cityProvince,
    district,
    khoroo,
    isAddress,
  } = userInput;

  const query = Place.find();

  if (valueRequired(cityProvince)) {
    const result = await cityProvinceSearch(cityProvince);
    if (result) query.where("cityProvince").in(result);
  }

  if (valueRequired(district)) {
    const result = await districtSearch(district);
    if (result) query.where("district").in(result);
  }

  if (valueRequired(khoroo)) {
    const result = await khorooSearch(khoroo);
    if (result) query.where("khoroo").in(result);
  }

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

  if (valueRequired(isAddress)) {
    if (isAddress.split(",").length > 1)
      query.where("isAddress").in(isAddress.split(","));
    else query.where("isAddress").equals(isAddress);
  }

  if (valueRequired(star)) {
    if (star.split(",").length > 1) query.where("star").in(star.split(","));
    else query.where("star").equals(star);
  }

  if (valueRequired(categories)) {
    const ids = await placeCategorySearch(categories);
    if (ids.length > 0) query.where("categories").in(ids);
  }

  if (valueRequired(sort)) query.sort(sortBuild(sort, sortDefualt));

  query
    .populate("createUser")
    .populate("updateUser")
    .populate("categories")
    .populate("district")
    .populate("cityProvince")
    .populate("khoroo");

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
    .populate("updateUser")
    .populate("district")
    .populate("cityProvince")
    .populate("khoroo");

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
  const { type, coordinates, cityProvince, district, khoroo } = req.body;

  if (!valueRequired(cityProvince)) req.body.cityProvince = null;
  if (!valueRequired(district)) req.body.district = null;
  if (!valueRequired(khoroo)) req.body.khoroo = null;

  req.body.location = {
    type,
    coordinates,
  };

  const uniqueName = await Place.find({ name: userInput["name"] });

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
  if (!userInput["addressText"]) req.body.addressText = [];

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

const getRandomCategories = async () => {
  const categories = await PlaceCategory.aggregate([{ $sample: { size: 2 } }]);
  if (categories.length < 2) {
    throw new MyError("Хангалттай ангилал байхгүй байна.", 400);
  }
  return categories;
};

exports.getRandomCategoryPlaces = asyncHandler(async (req, res, next) => {
  try {
    const randomCategories = await getRandomCategories();

    const categoryIds = randomCategories.map((category) => category._id);

    const placesForCategory1 = await Place.aggregate([
      { $match: { categories: categoryIds[0], status: true } },
      { $sample: { size: 6 } },
    ]);

    const placesForCategory2 = await Place.aggregate([
      { $match: { categories: categoryIds[1], status: true } },
      { $sample: { size: 6 } },
    ]);

    res.status(200).json({
      success: true,
      data: [
        {
          categoryId: randomCategories[0]._id,
          name: randomCategories[0].name,
          data: placesForCategory1,
        },
        {
          categoryId: randomCategories[1]._id,
          name: randomCategories[1].name,
          data: placesForCategory2,
        },
      ],
    });
  } catch (error) {
    next(error);
  }
});
