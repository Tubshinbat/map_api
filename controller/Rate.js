const Rate = require("../models/Rate");
const Place = require('../models/Place');
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { valueRequired } = require("../lib/check");
const { placeSearch, userSearch } = require("../lib/searchOfterModel");
const { getModelPaths, sortBuild } = require("../lib/build");
const { imageDelete } = require("../lib/photoUpload");
const sortDefualt = { createAt: -1 };

exports.createRate = asyncHandler(async (req, res, next) => {
  req.body.status = false;

  if (valueRequired(req.body.rate)) {
    const rate = parseInt(req.body.rate);

    if (rate < 1 || rate > 5) {
      throw new MyError("Үнэлгээ 1-5ын хооронд өгөх боломжтой", "400");
    }
  }
  req.body.createUser = req.userId;
  const rate = await Rate.create(req.body);
  res.status(200).json({
    success: true,
    data: rate,
  });
});

exports.getRates = asyncHandler(async (req, res, next) => {
  const userInput = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || sortDefualt;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  // PARTNER FIELDS
  const strFields = getModelPaths(Rate);
  const place = req.query.place;
  const query = Rate.find();

  if (valueRequired(place)) {
    const ids = await placeSearch(place);
    if (ids) query.where("place").in(ids);
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

  if (valueRequired(sort)) query.sort(sortBuild(sort, sortDefualt));

  query.populate("createUser");
  query.populate("updateUser");
  query.populate("place");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.countDocuments();

  const pagination = await paginate(page, limit, Rate, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const rates = await query.exec();

  res.status(200).json({
    success: true,
    count: rates.length,
    data: rates,
    pagination,
  });
});

exports.multDeleteRate = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const rates = await Rate.find({ _id: { $in: ids } });

  if (rates.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөл олдсонгүй", 400);
  }

  rates.map(async (el) => {
    el.pictures && el.pictures.map(async (img) => await imageDelete(img));
  });

  await Rate.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.updateRate = asyncHandler(async (req, res) => {
  let rate = await Rate.findById(req.params.id);
  if (!rate) throw new MyError("Өгөгдөл олдсонгүй.", 404);
  if (!valueRequired(req.body.pictures)) req.body.pictures = [];

  const strFields = getModelPaths(Rate);

  if (valueRequired(strFields))
    strFields.map((path) => {
      if (!valueRequired(path)) req.body[path] = "";
    });

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  rate = await Rate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: rate,
  });
});

exports.getRate = asyncHandler(async (req, res, next) => {
  const rate = await Rate.findByIdAndUpdate(req.params.id).populate("place");

  if (!rate) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: rate,
  });
});

exports.getTopRatedPlaces = asyncHandler(async (req, res, next) => {
  try {
    const topRatedPlaces = await Rate.aggregate([
      {
        $group: {
          _id: "$place",
          averageRating: { $avg: "$rate" },
          totalReviews: { $sum: 1 },
        },
      },
      {
        $sort: {
          averageRating: -1,
          totalReviews: -1,
        },
      },
      {
        $lookup: {
          from: "places", // Танай Place цуглуулгын нэр байх ёстой
          localField: "_id",
          foreignField: "_id",
          as: "placeDetails",
        },
      },
      {
        $unwind: "$placeDetails",
      },
      {
        $project: {
          _id: 1,
          averageRating: 1,
          totalReviews: 1,
          placeDetails: {
            name: 1,
            addressText: 1,
            logo: 1,
            pictures: 1,
            categories: 1,
          },
        },
      },
      {
        $limit: 10, // Хүссэн газруудын тоог өөрчлөх
      },
    ]);

    res.status(200).json({
      success: true,
      data: topRatedPlaces,
    });
  } catch (error) {
    next(error);
  }
});


exports.getCountRate = asyncHandler(async (req, res) => {
  const count = await Rate.countDocuments();
  res.status(200).json({
    success: true,
    data: count,
  });
});
