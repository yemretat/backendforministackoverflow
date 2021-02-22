const multer = require("multer");
const path = require("path");
const CustomError = require("../../helpers/error/customError");

// storage , filefilter
const storage = multer.diskStorage({
  // dosyamızı nereye kaydedeceğini söylüyor
  destination: function (req, file, cb) {
    // server.js yani ana dosyamızın nerede olduğunu aldık
    const rootDir = path.dirname(require.main.filename);
    //public-uploads 'a atman için directory resimleri
    cb(null, path.join(rootDir, "/public/uploads"));
  },
  //attığımız dosyanın filename'ini belirliyoruz
  filename: function (req, file, cb) {
    //file -> mimetype -> image/png
    const extension = file.mimetype.split("/")[1];
    req.savedProfileImage = "image_" + req.user.id + "." + extension;
    cb(null, req.savedProfileImage);
  },
});
// hangi dosyalara izin vereceğimizi yazıyoruz
const fileFilter = (req, file, cb) => {
  let allowedMimeTypes = ["image/jpg", "image/gif", "image/jpeg", "image/png"];
  // gelen mime typelardan bunlardan biri mi kontrol et
  if (!allowedMimeTypes.includes(file.mimetype)) {
    //callback yani cb nin 2. parametresine false verdik çünkü dosya işlemine
    // devam etmememiz lazım.
    return cb(new CustomError("Please provide a valid image file", 400), false);
  }
  //foto upload işlemi dewam etsin diye true verdik.
  return cb(null, true);
};
const profileImageUpload = multer({ storage, fileFilter });
module.exports = profileImageUpload;
