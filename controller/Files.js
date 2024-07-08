const path = require("path");
const { writeFileSync } = require("fs");

const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const fs = require("fs");

const imageUpload = (fileData, generator) => {
  return new Promise((resolve, reject) => {
    let fileName, files;
    files = fileData.file;

    files.name = `${generator}_${files.name}`;
    files.mv(`${process.env.IMAGE_UPLOAD_PATH}/${files.name}`, (error) => {
      if (error) {
        reject("Файлыг хуулах явцад алдаа гарлаа. Алдаа: " + error.message);
      }
      fileName = files.name;
      resolve(fileName);
    });
  });
};

const fileUpload = (fileData, generator) => {
  return new Promise((resolve, reject) => {
    let fileName, files;
    files = fileData.file;

    files.name = `${generator}_${files.name}`;
    files.mv(`${process.env.FILE_UPLOAD_PATH}/${files.name}`, (error) => {
      if (error) {
        reject("Файлыг хуулах явцад алдаа гарлаа. Алдаа: " + error.message);
      }
      fileName = files.name;
      resolve(fileName);
    });
  });
};

const resizePhoto = (file) => {
  sharp(`${process.env.IMAGE_UPLOAD_PATH}/${file}`)
    .resize({
      width: 150,
      height: 150,
      fit: sharp.fit.cover,
    })
    .toFile(`${process.env.IMAGE_UPLOAD_PATH}/150x150/${file}`)
    .then(function (newFileInfo) {
      console.log("img croped" + newFileInfo);
    })
    .catch(function (err) {
      console.log(err);
    });

  sharp(`${process.env.IMAGE_UPLOAD_PATH}/${file}`)
    .resize({
      width: 300,
      height: 300,
      fit: sharp.fit.cover,
    })
    .toFile(`${process.env.IMAGE_UPLOAD_PATH}/350x350/${file}`)
    .then(function (newFileInfo) {
      console.log("img croped" + newFileInfo);
    })
    .catch(function (err) {
      console.log(err);
    });

  sharp(`${process.env.IMAGE_UPLOAD_PATH}/${file}`)
    .resize({
      width: 450,
    })
    .toFile(`${process.env.IMAGE_UPLOAD_PATH}/450/${file}`)
    .then(function (newFileInfo) {
      console.log("img croped" + newFileInfo);
    })
    .catch(function (err) {
      console.log(err);
    });
};

const imageDelete = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      fs.unlinkSync(process.env.IMAGE_UPLOAD_PATH + "/" + filePath);
      fs.unlinkSync(process.env.IMAGE_UPLOAD_PATH + "/150x150/" + filePath);
      fs.unlinkSync(process.env.IMAGE_UPLOAD_PATH + "/350x350/" + filePath);
      fs.unlinkSync(process.env.IMAGE_UPLOAD_PATH + "/450/" + filePath);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

const fileDelete = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      fs.unlinkSync(process.env.FILE_UPLOAD_PATH + "/" + filePath);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

exports.imgUpload = asyncHandler(async (req, res, next) => {
  const files = req.files;

  let file = "";
  if (!files) {
    throw new MyError("Та зураг upload хийнэ үү", 400);
  }

  await imageUpload(files, Date.now()).then((fileName) => {
    file.name = fileName;
    resizePhoto(fileName);
    res.status(200).json({
      success: true,
      data: fileName,
    });
  });
});

exports.uploadFile = async (fileData) => {
  const files = req.files;

  let file = "";
  if (!files) throw new MyError("Та зураг upload хийнэ үү", 400);

  await fileUpload(files, Date.now()).then((fileName) => {
    file.name = fileName;
    res.status(200).json({
      success: true,
      data: fileName,
    });
  });
};

exports.removeImage = asyncHandler(async (req, res) => {
  const file = req.body.file;
  const result = await imageDelete(file);
  if (result !== true) throw new MyError("Устгах үед алдаа гарлаа", "400");

  res.status(200).json({
    success: true,
  });
});

exports.removeFile = asyncHandler(async (req, res) => {
  const file = req.body.file;
  const result = await fileDelete(file);
  if (result !== true) throw new MyError("Устгах үед алдаа гарлаа", "400");

  res.status(200).json({
    success: true,
  });
});
