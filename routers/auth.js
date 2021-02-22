const express = require("express");
const {
  register,
  errorTest,
  tokentest,
  getUser,
  login,
  logout,
  imageUpload,
  forgotPassword,
  resetPassword,
  editDetails,
} = require("../controllers/auth");
const router = express.Router();
const { getAccessToRoute } = require("../middlewares/authorization/auth");
const profileImageUpload = require("../middlewares/libraries/profileImageUpload");
router.get("/", (req, res) => {
  res.send("Auth Home Page");
});

router.post("/register", register);
router.get("/error", errorTest);
router.get("/tokentest", getAccessToRoute, tokentest);
router.get("/profile", getAccessToRoute, getUser);
router.post("/login", login);
router.get("/logout", getAccessToRoute, logout);
router.post("/forgotpassword", forgotPassword);
router.post(
  "/upload",
  [getAccessToRoute, profileImageUpload.single("profile_image")],
  imageUpload
);
router.put("/resetpassword", resetPassword); //şifreyi güncelleyecez , resetPassword controller çalışacak
router.put("/edit", getAccessToRoute, getAccessToRoute, editDetails);
module.exports = router;
