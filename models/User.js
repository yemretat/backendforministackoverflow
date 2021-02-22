const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Question = require("./Question");
const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide a name"], //kullanıcı  name'i girmek zorunda
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      "Please provide a valid email",
    ],
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin", "superadmin"],
  },
  // passwordümüze dedik ki
  password: {
    type: String,
    minlength: [6, "Please Provide a password with min length 6"],
    required: [true, "Please provide a password"],
    select: false, // gözükmesin şifre userı loglarken demek
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  title: {
    type: String,
  },
  about: {
    type: String,
  },
  place: {
    type: String,
  },
  website: {
    type: String,
  },
  profile_image: {
    type: String,
    default: "default.jpg",
  },
  blocked: {
    // adminler kullanıcıyı blocklayabilir bunun default değeri falsedur !
    type: Boolean,
    default: false,
  },
  // user resetPassword route'ına giderse bu iki tokeni doldurmak istiyoruz

  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
});
UserSchema.methods.generateJwtFromUser = function () {
  const { JWT_SECRET_KEY, JWT_EXPIRE } = process.env;

  const payload = {
    id: this._id,
    name: this.name,
  };
  const token = jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRE,
  });
  return token;
};
UserSchema.methods.getResetPasswordTokenFromUser = function () {
  const randomHexString = crypto.randomBytes(15).toString("hex"); //random hexadecimal string oluştur
  const { RESET_PASSWORD_EXPIRE } = process.env;
  const resetPasswordToken = crypto
    .createHash("SHA256")
    .update(randomHexString)
    .digest("hex");
  this.resetPasswordToken = resetPasswordToken;
  this.resetPasswordExpire = Date.now() + parseInt(RESET_PASSWORD_EXPIRE);
  return resetPasswordToken;
};
//Modelimizi kaydetmeden önce bir işlem gerçekleştiricez.
//arrow function,function ilişkisini incele
UserSchema.pre("save", function (next) {
  //console.log("Pre Hooks : Save");
  //console.log(this); // this bize kayıt atacağımız UserModelini gösterdi
  // ilerleyen dönemlerde mesela update attım password değişmemişse yeniden hashleme diye if soruyoruz
  if (!this.isModified("password")) {
    next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      // hashlenmis password buradaki hash
      if (err) next(err); // eğer hata olmuşsa errorümüzü burada gönderebiliriz
      this.password = hash;
      next();
    });
  });
  //next()
});
//remove olduktan sonra ,
UserSchema.post("remove", async function () {
  await Question.deleteMany({
    user: this._id,
  });
});

module.exports = mongoose.model("User", UserSchema);
