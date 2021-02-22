const User = require("../models/User");
const CustomError = require("../helpers/error/customError");
const asyncErrorWrapper = require("express-async-handler");
const { sendJwtToClient } = require("../helpers/authorization/tokenHelpers");
const {
  validateUserInput,
  comparePassword,
} = require("../helpers/input/inputHelper");

const sendEmail = require("../helpers/libraries/sendEmail");
const { response } = require("express");

// hatalarımızı try-catch yapısı kullanmadan direkt asyncHandlera ver o da bizim customHandlerımıza
// yollasın
const register = asyncErrorWrapper(async (req, res, next) => {
  // fonksiyonda async yazmamızın nedeni
  // altta await kullanabilmek
  // Post Data
  // responseda tokeni gönder ve cookieye kaydet!
  const { name, email, password, role } = req.body;

  // async await ile database'e kayıt atma
  //try {
  const user = await User.create({
    name,
    email,
    password,
    role,
  }); // name:name yapmamıza gerek yok otomatik aynı isimlileri aynı yere koyacak
  sendJwtToClient(user, res);

  //  } catch (err) {
  //return next(err); // erroru next parametresiyle errorHandler middleware'ine geçirmeye çalış
  //  }
});
// logout işleminde cookie ve environmentdan tokenleri sileceksin o kadar
const logout = asyncErrorWrapper(async (req, res, next) => {
  // env değişkenlerini alalım
  const { NODE_ENV } = process.env;

  return res
    .status(200)
    .cookie({
      httpOnly: true,
      expires: new Date(Date.now()), // expire'ı öldürüyor
      secure: NODE_ENV === "development" ? false : true,
    })
    .json({
      success: true,
      message: "Logout Successfull",
    });
});

const login = asyncErrorWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!validateUserInput(email, password)) {
    return next(new CustomError("Please check your inputs", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  console.log(user);
  if (!comparePassword(password, user.password)) {
    return next(new CustomError("Please Check your credentials", 400));
  }
  sendJwtToClient(user, res);
});

const errorTest = (req, res, next) => {
  return next(new SyntaxError("Bir hata oluştu"));
  // new Error("Bir hata") error classımızda status kodlar yer almıyor.Kendimiz
  // bu yüzden customError class oluşturuyoruz
  //return next(new CustomerError("Custom Error Message", 400));

  //burada hata fırlatıyorsun express kendi error mekanizmasıyla yakalar responseunu döner
};
const tokentest = (req, res, next) => {
  res.json({
    success: true,
    message: "Welcome",
  });
};
const getUser = (req, res, next) => {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      name: req.user.name,
    },
  });
  //burada controllerın dönme işlemi
};
const imageUpload = asyncErrorWrapper(async (req, res, next) => {
  // zaten servera eklenmiş olacak image middleware'de burada db'de
  // isim verecez
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      profile_image: req.savedProfileImage,
    },
    {
      new: true,
      runValidators: true, // burada user'a güncellenmiş şeyi dönsün diye new true dedik validatorlar çalışsın diye de true dedik
    }
  );

  res.status(200).json({
    success: true,
    message: "Image Upload Successfull",
    data: user,
  });
});
const forgotPassword = asyncErrorWrapper(async (req, res, next) => {
  //kullanıcadan resetEmail gelecek
  const resetEmail = req.body.email;
  const user = await User.findOne({ email: resetEmail });
  // biz mesela await ile beklemeseydik user promise olarak kalırdı
  // aşağıdaki if'e girmezdi çünkü ne defined ne undefined ortada bir şey

  if (!user) {
    return next(new CustomError("There is no user with that email", 400));
  }
  console.log(user);
  const resetPasswordToken = user.getResetPasswordTokenFromUser();

  await user.save();

  //burada sıfırlama linkini oluşturuyoruz.
  const resetPasswordUrl = `http://localhost:5001/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}`;

  const emailTemplate = `<h3>Reset Your Password</h3>
  <p>This <a href ='${resetPasswordUrl}' target='_blank'>link</a> will expire in 1 hour.</p>`;
  try {
    //eğer sıkıntı olursa resetpasswordtokeni undefined yapıcaz.Burada geri dönme imkanımız yok çünkü save ettik diye
    //kendi error handlerımızı kullanmaya çalışıyoruz merkeziyi değil.
    await sendEmail({
      from: process.env.SMTP_USER,
      to: resetEmail,
      subject: "Reset Your Password",
      html: emailTemplate,
    });
    console.log("anan");
    return res.status(200).json({
      success: true,
      message: "Token Sent To Your Email",
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return next(new CustomError("Email could not be sent", 500));
  }
});
const resetPassword = asyncErrorWrapper(async (req, res, next) => {
  const { resetPasswordToken } = req.query; // req'den alacağız
  const { password } = req.body;

  if (!resetPasswordToken) {
    return next(new CustomError("Please provide a valid token", 400));
  }
  let user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }, //burada expire zamanı şimdi zamandan büyükse getir dedim mongodb özelliği
  });
  if (!user) {
    return next(new CustomError("Invalid Token or Session Expired", 404));
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save(); // veri tabanına yazmam lazım

  return res.status(200).json({
    success: true,
    message: "Reset Password Process Successful",
  });
});
const editDetails = asyncErrorWrapper(async (req, res, next) => {
  const editInformation = req.body;

  const user = await User.findByIdAndUpdate(req.user.id, editInformation, {
    new: true,
    runValidators: true,
  });
  return res.status(200).json({
    success: true,
    data: user,
  });
});
module.exports = {
  register: register,
  errorTest,
  tokentest,
  getUser,
  login,
  logout,
  imageUpload,
  forgotPassword,
  resetPassword,
  editDetails,
};
