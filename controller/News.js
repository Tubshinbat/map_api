const News = require("../models/News");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
// const fs = require("fs");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { slugify } = require("transliteration");
const {
  userSearch,
  useNewsCategorySearch,
  RegexOptions,
} = require("../lib/searchOfterModel");
const { sortBuild, getModelPaths } = require("../lib/build");
const sortDefualt = { createAt: -1 };

exports.createNews = asyncHandler(async (req, res) => {
  req.body.createUser = req.userId;
  req.body.status = (valueRequired(req.body.status) && req.body.status) || true;
  const slug = req.body.slug;

  const uniqueName = await News.find({ slug });

  if (uniqueName.length > 0) {
    const countSlug = uniqueName.length + 1;
    req.body.slug = slug + "_" + countSlug;
  }

  if (!valueRequired(req.body.createAt)) delete req.body.createAt;

  const news = await News.create(req.body);

  res.status(200).json({
    success: true,
    data: news,
  });
});

exports.getNews = asyncHandler(async (req, res, next) => {
  const userInput = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  let sort = req.query.sort || sortDefualt;

  // NEWS FIELDS
  const strFields = getModelPaths(News);
  const categories = req.query.categories;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const category = req.query.category;
  const status = userInput["status"];
  const star = userInput["star"];

  const query = News.find();

  if (valueRequired(category)) {
    const catIds = await useNewsCategorySearch(category);
    query.where("categories").in(catIds);
  }

  if (valueRequired(categories)) {
    const splitData = categories.split(",");
    if (splitData.length > 1) {
      query.where("categories").in(splitData);
    } else {
      query.where("categories").in(categories);
    }
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

  if (valueRequired(star)) {
    if (star.split(",").length > 1) query.where("star").in(star.split(","));
    else query.where("star").equals(star);
  }

  if (valueRequired(sort)) query.sort(sortBuild(sort, sortDefualt));

  query.populate("categories");
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.countDocuments();

  const pagination = await paginate(page, limit, News, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const news = await query.exec();

  res.status(200).json({
    success: true,
    count: news.length,
    data: news,
    pagination,
  });
});

const getFullData = async (req, page) => {
  const limit = 25;
  const select = req.query.select;

  const userInputs = req.query;
  const fields = ["status", "star", "name", "type", "categories"];
  const categories = req.query.categories;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const category = req.query.category;

  const query = News.find();

  if (valueRequired(category)) {
    const catIds = await useNewsCategorySearch(category);

    if (catIds.length > 0) {
      query.where("categories").in(catIds);
    }
  }

  if (valueRequired(categories)) {
    const splitData = categories.split(",");
    if (splitData.length > 1) {
      query.where("categories").in(splitData);
    } else {
      query.where("categories").in(categories);
    }
  }

  fields.map((field) => {
    if (valueRequired(userInputs[field])) {
      const arrayList = userInputs[field].split(",");
      if (arrayList > 1) query.find({ field: { $in: arrayList } });
      else query.find({ field: RegexOptions(userInputs[field]) });
    }
  });

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) {
      query.where("createUser").in(userData);
    }
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) {
      query.where("updateUser").in(userData);
    }
  }

  if (valueRequired(sort)) {
    if (typeof sort === "string") {
      const spliteSort = sort.split(":");
      if (spliteSort.length > 0) {
        let convertSort = {};
        if (spliteSort[1] === "ascend") {
          convertSort = { [spliteSort[0]]: 1 };
        } else {
          convertSort = { [spliteSort[0]]: -1 };
        }
        if (spliteSort[0] != "undefined") query.sort(convertSort);
      }

      const splite = sort.split("_");
      if (splite.length > 0) {
        let convertSort = {};
        if (splite[1] === "ascend") {
          convertSort = { [splite[0]]: 1 };
        } else {
          convertSort = { [splite[0]]: -1 };
        }
        if (splite[0] != "undefined") query.sort(convertSort);
      }
    } else {
      query.sort(sort);
    }
  }

  query.select(select);
  query.populate("categories");
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.countDocuments();

  const pagination = await paginate(page, limit, News, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const news = await query.exec();

  return news;
};

exports.excelData = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // NEWS FIELD
  const userInputs = req.query;
  const fields = ["name", "type", "categories"];
  const categories = req.query.categories;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const category = req.query.category;
  const status = req.query.status;
  const star = req.query.star;

  const query = News.find();

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(star)) {
    if (star.split(",").length > 1) {
      query.where("star").in(star.split(","));
    } else query.where("star").equals(star);
  }

  if (valueRequired(category)) {
    const catIds = await useNewsCategorySearch(category);
    console.log(catIds);
    if (catIds.length > 0) {
      query.where("categories").in(catIds);
    }
  }

  if (valueRequired(categories)) {
    const splitData = categories.split(",");
    if (splitData.length > 1) {
      query.where("categories").in(splitData);
    } else {
      query.where("categories").in(categories);
    }
  }

  fields.map((field) => {
    if (valueRequired(userInputs[field])) {
      const arrayList = userInputs[field].split(",");
      if (arrayList > 1) query.find({ field: { $in: arrayList } });
      else query.find({ field: RegexOptions(userInputs[field]) });
    }
  });

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) {
      query.where("createUser").in(userData);
    }
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) {
      query.where("updateUser").in(userData);
    }
  }

  if (valueRequired(sort)) {
    if (typeof sort === "string") {
      const spliteSort = sort.split(":");
      if (spliteSort.length > 0) {
        let convertSort = {};
        if (spliteSort[1] === "ascend") {
          convertSort = { [spliteSort[0]]: 1 };
        } else {
          convertSort = { [spliteSort[0]]: -1 };
        }
        if (spliteSort[0] != "undefined") query.sort(convertSort);
      }

      const splite = sort.split("_");
      if (splite.length > 0) {
        let convertSort = {};
        if (splite[1] === "ascend") {
          convertSort = { [splite[0]]: 1 };
        } else {
          convertSort = { [splite[0]]: -1 };
        }
        if (splite[0] != "undefined") query.sort(convertSort);
      }
    } else {
      query.sort(sort);
    }
  }

  query.select(select);
  query.populate("categories");
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.countDocuments();
  const pagination = await paginate(page, limit, News, result);
  const pageCount = pagination.pageCount;
  let datas = [];

  for (let i = 1; i <= pageCount; i++) {
    const res = await getFullData(req, i);
    datas.push(...res);
  }

  res.status(200).json({
    success: true,
    data: datas,
  });
});

exports.multDeleteNews = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findNews = await News.find({ _id: { $in: ids } });

  if (findNews.length <= 0) {
    throw new MyError("Таны сонгосон мэдээнүүд олдсонгүй", 400);
  }
  findNews.map(async (el) => {
    el.pictures && el.pictures.map(async (img) => await imageDelete(img));
  });

  await News.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getSingleNews = asyncHandler(async (req, res, next) => {
  const news = await News.findById(req.params.id).populate("categories");

  if (!news) {
    throw new MyError("Тухайн мэдээ олдсонгүй. ", 404);
  }

  news.views = news.views + 1;
  news.save();

  res.status(200).json({
    success: true,
    data: news,
  });
});

exports.getSlugSingleNews = asyncHandler(async (req, res, next) => {
  const news = await News.findOne({ slug: req.query.slug }).populate(
    "categories"
  );

  news.views = news.views + 1;
  news.save();

  if (!news) {
    throw new MyError("Тухайн мэдээ олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: news,
  });
});

exports.updateNews = asyncHandler(async (req, res, next) => {
  let news = await News.findById(req.params.id);

  if (!news) {
    throw new MyError("Тухайн мэдээ олдсонгүй. ", 404);
  }

  const slug = req.body.slug;
  const uniqueName = await News.find({ slug });

  if (uniqueName.length > 0) {
    const countSlug = uniqueName.length + 1;
    req.body.slug = slug + "_" + countSlug;
  }

  if (!valueRequired(req.body.createAt)) delete req.body.createAt;
  if (!valueRequired(req.body.pictures)) req.body.pictures = [];
  if (!valueRequired(req.body.categories)) req.body.categories = [];

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  news = await News.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: news,
  });
});

exports.getCountNews = asyncHandler(async (req, res, next) => {
  const news = await News.countDocuments();
  res.status(200).json({
    success: true,
    data: news,
  });
});

exports.getSlugNews = asyncHandler(async (req, res, next) => {
  const news = await News.findOne({ slug: req.params.slug }).populate(
    "createUser"
  );

  if (!news) {
    throw new MyError("Тухайн мэдээ олдсонгүй. ", 404);
  }

  news.views = news.views + 1;
  news.update();

  res.status(200).json({
    success: true,
    data: news,
  });
});
