const Rate = require("../models/Rate");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { valueRequired } = require("../lib/check");
const { placeSearch } = require("../lib/searchOfterModel");

exports.createRate = asyncHandler(async (req, res, next) => {
  req.body.status = false;

  if (valueRequired(req.body.rate)) {
    const rate = parseInt(req.body.rate);
    if (rate <= 0 && rate > 5) {
      throw new MyError("Үнэлгээ 1-5ын хооронд өгөх боломжтой", "400");
    }
  }

  const rate = await Rate.create(req.body);
  res.status(200).json({
    success: true,
    data: rate,
  });
});

exports.getRates = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // PARTNER FIELDS
  const rate = req.query.rate;
  const place = req.query.place;

  const query = Rate.find();

  if (valueRequired(place)) {
    const ids = await placeSearch(place);
    if (ids) query.where("place").in(ids);
  }

  if (valueRequired(sort)) {
    if (typeof sort === "string") {
      const spliteSort = sort.split(":");
      let convertSort = {};
      if (spliteSort[1] === "ascend") {
        convertSort = { [spliteSort[0]]: 1 };
      } else {
        convertSort = { [spliteSort[0]]: -1 };
      }
      if (spliteSort[0] != "undefined") query.sort(convertSort);
    } else {
      query.sort(sort);
    }
  }

  query.select(select);
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

  await Rate.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
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

exports.getCountRate = asyncHandler(async (req, res) => {
  const count = await Rate.countDocuments();
  res.status(200).json({
    success: true,
    data: count,
  });
});
