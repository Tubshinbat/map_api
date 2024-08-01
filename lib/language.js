const Language = require("../models/Language");
const { valueRequired } = require("./check");

const arrayToObject = (arr) => {
  const obj = {};
  arr.forEach((item) => {
    const key = Object.keys(item)[0];
    const value = item[key];
    if (value !== "undefined" && typeof value !== "undefined") {
      obj[key] = value;
    }
  });
  return obj;
};

const languageData = async (lang, paths, banner, callUser = false) => {
  const result = await Language.findOne({ languageCode: lang });
  const languagies = await Language.find({});
  let language = null;
  if (result) {
    if (!banner.language[lang] && callUser) {
      languagies.map((el) => {
        if (banner.language[el]) {
          language = el;
        }
      });
      if (language) {
        paths.map((path) => {
          banner[path] = banner.language[language][path];
        });
      }
    } else {
      paths.map(async (path) => {
        if (valueRequired(banner.language[lang])) {
          banner[path] = banner.language[lang][path];
        } else if (!callUser) {
          banner[path] = "";
        }
      });
    }
  }
};

exports.buildLanguage = async (lang, paths, userInput) => {
  try {
    const result = await Language.findOne({ languageCode: lang });
    if (result) {
      const arr = paths.map((path) => {
        return { [path]: userInput[path] };
      });
      const convertFields = arrayToObject(arr);
      return { [lang]: convertFields };
    }
    return false;
  } catch (error) {
    return false;
  }
};

exports.buildUpdateLanguage = async (lang, paths, userInput, data) => {
  try {
    const result = await Language.findOne({ languageCode: lang });
    if (result) {
      const arr = paths.map((path) => {
        return { [path]: userInput[path] };
      });
      const convertFields = arrayToObject(arr);
      const newData = { [lang]: convertFields };
      return { ...data, ...newData };
    }
    return false;
  } catch (error) {
    return false;
  }
};

exports.loadMultLangauge = async (lang, paths, userInputs, datas) => {};
