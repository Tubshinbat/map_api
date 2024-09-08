const PlaceCategory = require("../models/PlaceCategory");
const Place = require("../models/Place");
const District = require("../models/District");
const NewsCategories = require("../models/NewsCategories");
const User = require("../models/User");
const City = require("../models/City");
const Khoroo = require("../models/Khoroo");

exports.RegexOptions = (value) => {
  const regexNameSearch = { $regex: ".*" + value + ".*", $options: "i" };
  return regexNameSearch;
};

exports.placeCategorySearch = async (key) => {
  const ids = await PlaceCategory.find({
    name: this.RegexOptions(key),
  }).select("_id");
  return ids;
};

exports.userSearch = async (name) => {
  const userData = await User.find({
    firstName: this.RegexOptions(name),
  }).select("_id");
  return userData;
};

exports.cityProvinceSearch = async (query) => {
  const cities = await City.find({
    $or: [
      { name: new RegExp(query, "i") },
      { engName: new RegExp(query, "i") },
    ],
  });
  return cities;
};

exports.districtSearch = async (query) => {
  const datas = await District.find({
    $or: [
      { name: new RegExp(query, "i") },
      { engName: new RegExp(query, "i") },
    ],
  });
  return datas;
};

exports.khorooSearch = async (query) => {
  const datas = await Khoroo.find({
    $or: [
      { name: new RegExp(query, "i") },
      { engName: new RegExp(query, "i") },
    ],
  });
  return datas;
};

exports.placeSearch = async (key) => {
  const ids = await Place.find({ name: this.RegexOptions(key) }).select("_id");
  return ids;
};

exports.newsCategorySearch = async (name) => {
  const newsCategories = await NewsCategories.find({
    name: this.RegexOptions(name),
  }).select("_id");
  return newsCategories;
};
