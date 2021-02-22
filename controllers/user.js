const User = require("../models/User");
const CustomError = require("../helpers/error/customError");
const asyncErrorWrapper = require("express-async-handler");

const getSingleUser = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  const user = req.data;
  if (!user) {
    return next(new CustomError("There is no such user with that id", 400));
  }
  return res.status(200).json({ success: true, data: user });
});

const getAllUsers = asyncErrorWrapper(async (req, res, next) => {
  return res.status(200).json(res.queryResult);
});
module.exports = {
  getSingleUser,
  getAllUsers,
};
