const Order = require("../models/Order");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
// const fs = require("fs");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

const { userSearch, RegexOptions } = require("../lib/searchOfterModel");

const { sortBuild, getModelPaths } = require("../lib/build");
const sortDefualt = { createAt: -1 };

exports.createOrder = asyncHandler(async (req,res) => {
    const userInput = req.body;
    req.body.createUser = req.userId;

  
 
})