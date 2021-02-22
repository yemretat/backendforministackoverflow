const express = require("express");
// getAccessToRoutedan geç giriş yapmış kullanıcıya bakıyoruz yani giriş şart
const {
  getAccessToRoute,
  getAdminAccess,
} = require("../middlewares/authorization/auth");
const {
  checkUserExist,
} = require("../middlewares/databases/databaseErrorHelpers");
const { blockUser, deleteUser } = require("../controllers/admin");

const router = express.Router();
router.use([getAccessToRoute, getAdminAccess]); // Bu şekilde middleware kullanımı olmuş
// router.use(checkUserExist);

router.get("/block/:id", checkUserExist, blockUser); // yukarıdaki gibi yazarsak olmaz çünkü idyi algılamıyor
router.delete("/user/:id", checkUserExist, deleteUser);

module.exports = router;
