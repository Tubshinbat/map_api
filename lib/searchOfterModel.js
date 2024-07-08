const PlaceCategory = require("../models/PlaceCategory");
const Place = require("../models/Place");
const NewsCategories = require("../models/NewsCategories");
const User = require("../models/User");

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
