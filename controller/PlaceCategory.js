const PlaceCategory = require("../models/PlaceCategory");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");

const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { userSearch, placeCategorySearch } = require("../lib/searchOfterModel");
const { sortBuild, getModelPaths } = require("../lib/build");

// DEFUALT DATAS
const sortDefualt = { createAt: -1 };

exports.createPlaceCategory = asyncHandler(async (req, res) => {
  const parentId = req.body.parentId || null;
  const userInput = req.body;
  const strFields = getModelPaths(PlaceCategory);
  let position = 0;
  req.body.status = userInput["status"] || true;
  req.body.createUser = req.userId;

  if (parentId) {
    const category = await PlaceCategory.findOne({ parentId }).sort({
      position: -1,
    });
    if (category) {
      position = category.position + 1;
    }
  } else {
    const category = await PlaceCategory.findOne({ parentId: null }).sort({
      position: -1,
    });
    if (category) {
      position = category.position + 1;
    }
  }

  if (valueRequired(strFields))
    strFields.map((path) => {
      !valueRequired(userInput[path]) && delete req.body[path];
    });
  req.body.position = position;

  const category = await PlaceCategory.create(req.body);
  res.status(200).json({
    success: true,
    data: category,
  });
});

function createCategories(categories, parentId = null) {
  const categoryList = [];
  let category = null;

  if (parentId === null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }

  for (let cate of category) {
    categoryList.push({
      _id: cate._id,
      name: cate.name,
      position: cate.position,
      icon: cate.icon,
      children: createCategories(categories, cate._id),
    });
  }

  return categoryList;
}

const parentCheck = (menus) => {
  Array.isArray(menus) &&
    menus.map(async (menu) => {
      const result = await PlaceCategory.find({ parentId: menu._id });
      if (result && result.length > 0) {
        parentCheck(result);
      }
      await PlaceCategory.findByIdAndDelete(menu._id);
    });
};

exports.getPlaceCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await PlaceCategory.find({})
      .sort({ position: 1 })
      .exec();

    if (categories) {
      const categoryList = createCategories(categories);

      return res.status(200).json({
        success: true,
        data: categoryList,
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      error,
    });
  }
});

exports.multDeletePlaceCategory = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const finds = await Place.find({ _id: { $in: ids } });

  if (finds.length <= 0) throw new MyError("Өгөгдөлүүд олдсонгүй", 404);

  finds.map(async (el) => {
    el.pictures &&
      el.pictures.map(async (picture) => await imageDelete(picture));
  });

  await Place.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getPlaceCategory = asyncHandler(async (req, res) => {
  const category = await PlaceCategory.findById(req.params.id);

  if (!category) {
    throw new MyError("Өгөгдөл олдсонгүй.", 404);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.updatePlaceCategory = asyncHandler(async (req, res, next) => {
  let category = await PlaceCategory.findById(req.params.id);
  if (!category) throw new MyError("Өгөгдөл олдсонгүй. ", 404);

  const userInput = req.body;
  const strFields = getModelPaths(PlaceCategory);

  if (valueRequired(strFields))
    strFields.map((path) => {
      if (!valueRequired(path)) req.body[path] = "";
    });

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  category = await PlaceCategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.deletePlaceCategory = asyncHandler(async (req, res) => {
  const category = await PlaceCategory.findById(req.params.id);
  if (!category) throw new MyError("Өгөгдөл олдсонгүй.", 404);
  if (category.icon) await imageDelete(category.icon);

  const parentMenus = await PlaceCategory.find({ parentId: req.params.id });
  if (parentMenus) parentCheck(parentMenus);
  await PlaceCategory.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.changePosition = asyncHandler(async (req, res) => {
  menus = req.body.data;

  if (!menus && menus.length > 0) {
    throw new MyError("Дата илгээгүй байна дахин шалгана уу", 404);
  }

  const positionChange = (categories, pKey = null) => {
    if (categories) {
      categories.map(async (el, index) => {
        const data = {
          position: index,
          parentId: pKey,
        };
        await PlaceCategory.findByIdAndUpdate(el.key, data);
        if (el.children && el.children.length > 0) {
          const parentKey = el.key;
          positionChange(el.children, parentKey);
        }
      });
    }
  };

  positionChange(menus);

  res.status(200).json({
    success: true,
  });
});

exports.getCountPlaceCategory = asyncHandler(async (req, res, next) => {
  const count = await PlaceCategory.countDocuments();
  res.status(200).json({
    success: true,
    data: count,
  });
});
