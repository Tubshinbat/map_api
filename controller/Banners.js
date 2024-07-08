const Banner = require("../models/Banner");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const Language = require("../models/Language");

const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { userSearch } = require("../lib/searchOfterModel");
const { sortBuild, getModelPaths } = require("../lib/build");
const { buildLanguage, buildUpdateLanguage } = require("../lib/language");

// DEFUALT DATAS
const sortDefualt = { createAt: -1 };

exports.createBanner = asyncHandler(async (req, res) => {
  const userInput = req.body;
  const strFields = getModelPaths(Banner);
  req.body.type = userInput["type"] || "photo";
  req.body.status = userInput["status"] || true;
  req.body.createUser = req.userId;

  if (valueRequired(strFields))
    strFields.map((path) => {
      !valueRequired(userInput[path]) && delete req.body[path];
    });

  if (req.body.type == "photo" && !valueRequired(userInput["picture"]))
    throw new MyError("Зураг оруулна уу.", 400);
  if (req.body.type == "video") {
    const banner = await Banner.find({ type: "video" });
    if (banner.length > 0)
      throw new MyError(
        "Вэб сайтын слайд хэсэгт нэг л видео оруулах боломжтой.",
        400
      );

    if (!valueRequired(req.body.video))
      throw new MyError("Видео оруулна уу.", 400);
  }

  // if (process.env.LANGUAGE == "TRUE") {
  //   const language = req.cookies.language || null;
  //   if (valueRequired(language)) {
  //     const result = await buildLanguage(language, strFields, userInput);
  //     if (result != false) {
  //       strFields.map((path) => delete req.body[path]);
  //       req.body.language = result;
  //     }
  //   }
  // }

  const banner = await Banner.create(req.body);
  res.status(200).json({
    success: true,
    data: banner,
  });
});

exports.getBanners = asyncHandler(async (req, res) => {
  const userInput = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || sortDefualt;

  //  FIELDS
  const strFields = getModelPaths(Banner);
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];
  const status = userInput["status"];
  const type = userInput["type"];

  const query = Banner.find();

  strFields.map((el) => {
    if (valueRequired(userInput[el]))
      query.find({ [el]: RegexOptions(userInput[el]) });
  });

  if (valueRequired(type)) query.where("type").equals(type);

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

  const pagination = await paginate(page, limit, Banner, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const banners = await query.exec();

  res.status(200).json({
    success: true,
    count: banners.length,
    data: banners,
    pagination,
  });
});

exports.multDeleteBanner = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const finds = await Banner.find({ _id: { $in: ids } });

  if (finds.length <= 0) throw new MyError("Өгөгдөлүүд олдсонгүй", 404);

  finds.map(async (el) => {
    el.photo && (await imageDelete(el.photo));
    el.video && (await imageDelete(el.video));
  });

  await Banner.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.deleteBanner = asyncHandler(async (req, res) => {
  const item = await Banner.findByIdAndDelete(req.params.id);
  if (!item) throw new MyError("Өгөгдөл олдсонгүй.", 404);

  res.status(200).json({
    success: true,
  });
});

exports.getBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id)
    .populate("createUser")
    .populate("updateUser");

  if (!banner) throw new MyError("Өгөгдөл олдсонгүй. ", 404);

  const strFields = getModelPaths(Banner);
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
    data: banner,
  });
});

exports.updateBanner = asyncHandler(async (req, res, next) => {
  let banner = await Banner.findById(req.params.id);
  if (!banner) throw new MyError("Өгөгдөл олдсонгүй. ", 404);

  const userInput = req.body;
  const strFields = getModelPaths(Banner);

  if (valueRequired(strFields))
    strFields.map((path) => {
      if (!valueRequired(path)) req.body[path] = "";
    });

  if (userInput["type"] == "photo" && !valueRequired(userInput["picture"]))
    throw new MyError("Зураг оруулна уу.", 400);

  if (userInput["type"] == "video") {
    const checkBanner = await Banner.find({ type: "video" });
    if (banner.type == "video" && !valueRequired(userInput["video"])) {
      throw new MyError("Видео оруулна уу.", 400);
    } else if (checkBanner.length > 0) {
      throw new MyError(
        "Вэб сайтын слайд хэсэгт нэг л видео оруулах боломжтой.",
        400
      );
    }
  }

  // if (process.env.LANGUAGE == "TRUE") {
  //   const language = req.cookies.language || null;
  //   if (valueRequired(language)) {
  //     const result = await buildUpdateLanguage(
  //       language,
  //       strFields,
  //       userInput,
  //       banner.language
  //     );

  //     if (result != false) {
  //       strFields.map((path) => delete req.body[path]);
  //       req.body.language = result;
  //     }
  //   }
  // }

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: banner,
  });
});

exports.getCountBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.countDocuments();
  res.status(200).json({
    success: true,
    data: banner,
  });
});
