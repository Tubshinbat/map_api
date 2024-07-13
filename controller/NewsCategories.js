const NewsCategory = require("../models/NewsCategories");
const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");
const { slugify } = require("transliteration");
const { valueRequired } = require("../lib/check");

exports.createNewsCategory = asyncHandler(async (req, res, next) => {
  const parentId = req.body.parentId || null;
  let position = 0;
  if (parentId) {
    const category = await NewsCategory.findOne({ parentId }).sort({
      position: -1,
    });
    if (category) {
      position = category.position + 1;
    }
  } else {
    const category = await NewsCategory.findOne({ parentId: null }).sort({
      position: -1,
    });
    if (category) {
      position = category.position + 1;
    }
  }
  req.body.position = position;

  const uniqueName = await NewsCategory.find({ name: req.body.name });
  if (uniqueName.length > 0) {
    req.body.slug = slugify(uniqueName + "_" + uniqueName.length);
  }

  const category = await NewsCategory.create(req.body);
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
      slug: cate.slug,
      position: cate.position,
      children: createCategories(categories, cate._id),
    });
  }

  return categoryList;
}

exports.getNewsCategories = asyncHandler(async (req, res, next) => {
  try {
    const categories = await NewsCategory.find({}).sort({ position: 1 }).exec();

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

exports.getNewsCategory = asyncHandler(async (req, res, next) => {
  const newsCategory = await NewsCategory.findById(req.params.id);

  if (!newsCategory) {
    throw new MyError(req.params.id + " Тус мэдээний ангилал олдсонгүй.", 404);
  }

  res.status(200).json({
    success: true,
    data: newsCategory,
  });
});

exports.getSlugCategory = asyncHandler(async (req, res, next) => {
  const newsCategory = await NewsCategory.findOne({})
    .where("name")
    .equals(req.params.slug);

  if (!newsCategory) {
    throw new MyError(req.params.id + " Тус мэдээний ангилал олдсонгүй.", 404);
  }

  res.status(200).json({
    success: true,
    data: newsCategory,
  });
});

const parentCheck = (menus) => {
  menus.map(async (menu) => {
    const result = await NewsCategory.find({ parentId: menu._id });
    if (result && result.length > 0) {
      parentCheck(result);
    }
    await NewsCategory.findByIdAndDelete(menu._id);
  });
};

exports.deletetNewsCategory = asyncHandler(async (req, res, next) => {
  const category = await NewsCategory.findById(req.params.id);
  if (!category) {
    throw new MyError(req.params.id + " ангилал олдсонгүй", 404);
  }
  const parentMenus = await NewsCategory.find({ parentId: req.params.id });

  if (parentMenus) {
    parentCheck(parentMenus);
  }

  await NewsCategory.findByIdAndDelete(req.params.id);

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
        await NewsCategory.findByIdAndUpdate(el.key, data);
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

exports.updateNewsCategory = asyncHandler(async (req, res, next) => {
  if (!valueRequired(req.body.name)) {
    throw new MyError("Талбарыг бөгөлнө үү", 400);
  }

  const result = await NewsCategory.findById(req.params.id);

  if (!result) {
    throw new MyError("Өгөгдөл олдсонгүй дахин оролдоно үү", 404);
  }

  const name = req.body.name;

  const nameUnique = await NewsCategory.find({}).where("name").equals(name);

  if (nameUnique.length > 0) {
    req.body.slug =
      nameUnique[nameUnique.length - 1].slug +
      (nameUnique.length + 1).toString();
  } else {
    req.body.slug = slugify(name);
  }

  const category = await NewsCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!category) {
    throw new MyError("Ангилалын нэр солигдсонгүй", 400);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});
