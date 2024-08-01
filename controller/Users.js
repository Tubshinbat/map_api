const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const paginate = require("../utils/paginate");
const fs = require("fs");

const { valueRequired } = require("../lib/check");
const { RegexOptions, userSearch } = require("../lib/searchOfterModel");
const { getModelPaths, sortBuild } = require("../lib/build");
const { imageDelete } = require("../lib/photoUpload");
const sendEmail = require("../utils/email");

const sortDefualt = { createAt: -1 };

// Register
exports.register = asyncHandler(async (req, res) => {
  const userInput = req.body;
  const strFields = getModelPaths(User);

  req.body.email = userInput["email"].trim().toLowerCase();

  if (valueRequired(strFields))
    strFields.map((path) => {
      !valueRequired(path) && delete req.body[path];
    });

  const user = await User.create(req.body);

  res.status(200).json({
    success: true,
    token: jwt,
    data: user,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const userInput = req.body;

  if (
    !valueRequired(userInput["email"]) ||
    !valueRequired(userInput["password"])
  )
    throw new MyError("Имэйл болон нууц үгээ оруулна уу", 400);

  const user = await User.findOne({ email: userInput["email"] }).select(
    "+password"
  );

  if (!user) throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 401);
  const ok = await user.checkPassword(userInput["password"]);
  if (!ok) throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 401);

  if (user.status === false)
    throw new MyError("Уучлаарай таны эрхийг хаасан байна.");

  const token = user.getJsonWebToken();
  req.token = token;
  const cookieOption = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: false,
  };

  res.status(200).cookie("webrtoken", token, cookieOption).json({
    success: true,
    token,
    user,
  });
});

exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (user.status === false)
    throw new MyError("Уучлаарай таны эрхийг хаасан байна..", 400);

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const userInput = req.body;
  const userId = req.params.id;
  const strFields = getModelPaths(User);

  if (valueRequired(strFields)) {
    strFields.forEach((path) => {
      if (!valueRequired(userInput[path])) req.body[path] = "";
    });
  }

  req.body.email = userInput.email.trim().toLowerCase();
  req.body.age = parseInt(userInput.age) || 0;
  req.body.memberShip = req.body.memberShip || false;

  // Одоогийн хэрэглэгчийн мэдээллийг авах
  const currentUser = await User.findById(userId);

  if (!currentUser) throw new MyError("Хэрэглэгч олдсонгүй", 404);

  // Өөрийн email болон phonenumber -г update хийх үед unique шалгалтыг хийхгүй
  if (userInput.email !== currentUser.email) {
    const emailExists = await User.findOne({ email: userInput.email });
    if (emailExists)
      throw new MyError("Email аль хэдийн ашиглагдаж байна", 400);
  }

  if (parseInt(userInput.phoneNumber) !== parseInt(currentUser.phoneNumber)) {
    const phoneExists = await User.findOne({
      phonenumber: userInput.phonenumber,
    });
    if (phoneExists)
      throw new MyError("Утасны дугаар аль хэдийн ашиглагдаж байна", 400);
  }

  const user = await User.findByIdAndUpdate(userId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new MyError("Хэрэглэгчийн мэдээлэл шинэчилж чадсангүй", 404);

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.logout = asyncHandler(async (req, res) => {
  const cookieOption = {
    expires: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    httpOnly: false,
  };
  res.status(200).cookie("seruuntoken", null, cookieOption).json({
    success: true,
    data: "logout...",
  });
});

exports.phoneCheck = asyncHandler(async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const user = await User.findOne({ status: true })
    .where("phone")
    .equals(phoneNumber);

  if (!valueRequired(phoneNumber))
    throw new MyError("Утасны дугаараа оруулна уу");

  if (!user)
    throw new MyError("Уучлаарай утасны дугаараа шалгаад дахин оролдоно уу");

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const userInput = req.body;
  const userId = req.params.id;

  if (!valueRequired(userInput["password"]))
    throw new MyError("Нууц үгээ оруулна уу", 404);

  const user = await User.findById(userId);

  if (!user) throw new MyError("Системд алдаа гарлаа дахин оролдоно уу", 404);

  user.password = userInput["password"];
  user.resetPassword = undefined;
  user.resetPasswordExpire = undefined;
  user.updateAt = Date.now();
  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const userInput = req.query;
  const page = parseInt(userInput["page"]) || 1;
  const limit = parseInt(userInput["limit"]) || 25;
  const sort = userInput["sort"] || { createAt: -1 };

  // Fields
  const strFields = getModelPaths(User);
  const { createUser, updateUser, status } = userInput;

  //QueryStart
  const query = User.find();

  strFields.map((field) => {
    if (valueRequired(userInput[field]))
      query.find({ [field]: RegexOptions(userInput[field]) });
  });

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

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

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.countDocuments();

  const pagination = await paginate(page, limit, User, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const users = await query.exec();

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
    pagination,
  });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new MyError("Өгөгдөл олдсонгүй.", 404);
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.getCount = asyncHandler(async (req, res, next) => {
  const count = await User.countDocuments();
  res.status(200).json({
    success: true,
    data: count,
  });
});

exports.createUser = asyncHandler(async (req, res) => {
  const userInput = req.body;

  if (userInput.email) {
    userInput.email = userInput.email.trim().toLowerCase();
  }

  const strFields = getModelPaths(User);
  if (valueRequired(strFields))
    strFields.map((path) => {
      if (!valueRequired(path)) req.body[path] = "";
    });

  const user = await User.create(req.body);

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.multDeleteUsers = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  if (!ids) throw new MyError("Өгөгдөл олдсонгүй.", 400);
  const finds = await User.find({ _id: { $in: ids } });

  if (finds.length <= 0) throw new MyError("Өгөгдөл олдсонгүй", 404);

  finds.map(async (el) => {
    el.picture && (await imageDelete(el.picture));
  });

  const users = await User.deleteMany({ _id: { $in: ids } });
  res.status(200).json({
    success: true,
    data: users,
  });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!valueRequired(user)) throw new MyError("Өгөгдөл олдсонгүй.", 404);
  if (user.picture) imageDelete(user.picture);

  user.remove();
  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) throw new MyError("Имэйл хаягаа оруулна уу", 400);

  const user = await User.findOne({ email });
  if (!user) throw new MyError("Мэдээллээ дахин шалгана уу", 400);

  if (user.resetPasswordExpire >= Date.now()) {
    res.status(200).json({
      success: true,
      beforeOtp: true,
      resetPasswordExpire: user.resetPasswordExpire,
    });
    return;
  }

  const resetToken = user.generatePasswordChangeToken();
  await user.save({ validateBeforeSave: false });

  const message = ``;

  let htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Code</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f7f7f7;
              margin: 0;
              padding: 0;
          }
          .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              overflow: hidden;
          }
          .header {
              background-color: #3c5c8b;
              padding: 20px;
              color: white;
              text-align: center;
          }
          .content {
              padding: 20px;
              text-align: center;
          }
          .content p {
              font-size: 16px;
              line-height: 1.5;
              color: #333333;
          }
          .code {
              display: inline-block;
              padding: 10px 20px;
              font-size: 24px;
              font-weight: bold;
              color: #3c5c8b;
              background-color: #f0f0f0;
              border-radius: 4px;
              margin-top: 20px;
          }
          .footer {
              background-color: #f0f0f0;
              padding: 10px;
              text-align: center;
              font-size: 14px;
              color: #777777;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Баталгаажуулах код</h1>
          </div>
          <div class="content">
              <p>Сайн байна уу ${user.firstName},</p>
              <p>Та нууц үгээ сэргээхийн тулд доорх кодыг ашиглана уу:</p>
              <div class="code">${resetToken}</div>
              <p>Энэ код 2 минутын дараа хүчингүй болно.</p>
          </div>
          <div class="footer">
              <p>Хэрэв та энэ кодыг ашиглахгүй бол аккунт тань хуучин нууц үгээрээ үлдэнэ.</p>
          </div>
      </div>
  </body>
  </html>
  `;

  try {
    await sendEmail({
      subject: "Баталгаажуулах код",
      email,
      text: message,
      html: htmlContent,
    });
  } catch (error) {
    throw new MyError("Имэйл явуулахад алдаа гарлаа дахин оролдоно уу", 400);
  }

  res.status(200).json({
    success: true,
    beforeOtp: false,
  });
});

exports.verifyOTP = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  console.log(email);
  console.log(code);
  if (!email || !code)
    throw new MyError("Имэйл болон баталгаажуулах код оруулна уу", 400);

  const user = await User.findOne({
    email,
    resetPasswordToken: code,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw new MyError("Баталгаажуулах код хүчингүй байна", 400);

  res.status(200).json({
    success: true,
    data: "Баталгаажуулалт амжилттай боллоо.",
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, code, password } = req.body;
  if (!email || !code || !password)
    throw new MyError(
      "Баталгаажуулах код, имэйл болон шинэ нууц үгээ оруулна уу.",
      400
    );

  const user = await User.findOne({
    email,
    resetPasswordToken: code,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new MyError("Баталгаажуулах код хүчингүй байна", 400);
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Нууц үг амжилттай шинэчлэгдлээ.",
  });
});

exports.checklogin = asyncHandler(async (req, res) => {
  let token;
  if (req.headers.authorization) {
    token = req.header.authorization.split(" ")[1];
  } else if (req.cookies) {
    token = req.cookies["webrtoken"];
  }
  if (!token) throw new MyError("Уучлаарай хандах боломжгүй байна..", 400);

  try {
    const tokenObject = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
    });
  }
});
