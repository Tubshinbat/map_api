const Room = require("../models/Room");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");

const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { userSearch, placeSearch } = require("../lib/searchOfterModel");
const { sortBuild, getModelPaths } = require("../lib/build");

// DEFUALT DATAS
const sortDefualt = { createAt: -1 };

exports.createRoom = asyncHandler(async (req, res) => {
  const userInput = req.body;
  const strFields = getModelPaths(Room);
  req.body.status = userInput["status"] || true;
  req.body.createUser = req.userId;

  if (valueRequired(strFields))
    strFields.map((path) => {
      !valueRequired(userInput[path]) && delete req.body[path];
    });

  const room = await Room.create(req.body);
  res.status(200).json({
    success: true,
    data: room,
  });
});

exports.getRooms = asyncHandler(async (req, res) => {
  const userInput = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || sortDefualt;

  //  FIELDS
  const strFields = getModelPaths(Room);
  const createUser = userInput["createUser"];
  const updateUser = userInput["updateUser"];
  const status = userInput["status"];
  const place = userInput["place"];

  const query = Room.find();

  strFields.map((el) => {
    if (valueRequired(userInput[el]))
      query.find({ [el]: RegexOptions(userInput[el]) });
  });

  if (valueRequired(place)) {
    const ids = await placeSearch(place);
    if (ids) query.where("place").in(ids);
  }

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

  const pagination = await paginate(page, limit, Room, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const rooms = await query.exec();

  res.status(200).json({
    success: true,
    count: rooms.length,
    data: rooms,
    pagination,
  });
});

exports.multDeleteRoom = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const finds = await Room.find({ _id: { $in: ids } });

  if (finds.length <= 0) throw new MyError("Өгөгдөлүүд олдсонгүй", 404);

  finds.map(async (el) => {
    el.photo && (await imageDelete(el.photo));
  });

  await Room.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.deleteRoom = asyncHandler(async (req, res) => {
  const item = await Room.findByIdAndDelete(req.params.id);
  if (!item) throw new MyError("Өгөгдөл олдсонгүй.", 404);
  if (item.photo) await imageDelete(item.photo);

  res.status(200).json({
    success: true,
  });
});

exports.getRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id)
    .populate("place")
    .populate("createUser")
    .populate("updateUser");

  if (!room) throw new MyError("Өгөгдөл олдсонгүй. ", 404);

  const strFields = getModelPaths(Room);

  res.status(200).json({
    success: true,
    data: room,
  });
});

exports.updateRoom = asyncHandler(async (req, res, next) => {
  let room = await Room.findById(req.params.id);
  if (!room) throw new MyError("Өгөгдөл олдсонгүй. ", 404);

  const userInput = req.body;
  const strFields = getModelPaths(Room);

  if (valueRequired(strFields))
    strFields.map((path) => {
      if (!valueRequired(path)) req.body[path] = "";
    });

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  room = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: room,
  });
});

exports.getCountRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.countDocuments();
  res.status(200).json({
    success: true,
    data: room,
  });
});
