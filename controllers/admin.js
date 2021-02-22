const User = require("../models/User");
const CustomError = require("../helpers/error/customError");
const asyncErrorWrapper = require("express-async-handler");

const blockUser = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  user.blocked = !user.blocked; // burada yani şuanda neyse block durumu tersini yap
  await user.save();
  return res
    .status(200)
    .json({ success: true, message: "Block-unblock Successful!" });
});
const deleteUser = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  await user.remove();
  // UserSchemada post koyacaz silindikten sonra soruları da kaldırsın diye
  return res.status(200).json({
    success: true,
    message: "Delete Operation Successful",
  });
});

module.exports = { blockUser, deleteUser };
