// Bu middleware'imi auth routerında kullanıcam.!
const CustomError = require("../../helpers/error/customError");
const jwt = require("jsonwebtoken");
const asyncErrorWrapper = require("express-async-handler");
const {
  isTokenIncluded,
  getAccessTokenFromHeader,
} = require("../../helpers/authorization/tokenHelpers");
const Answer = require("../../models/Answer");
const User = require("../../models/User");
const Question = require("../../models/Question");

const getAccessToRoute = (req, res, next) => {
  console.log(req.headers.authorization);
  const { JWT_SECRET_KEY } = process.env;
  if (!isTokenIncluded(req)) {
    // 401 Unauthorization giriş yapmadan bir sayfaya ulaşma , 403 Forbidden
    //adminlerin erişebileceği yere erişmeye çalışma
    return next(
      new CustomError("You are not authorized to access the route", 401)
    );
  }
  const accessToken = getAccessTokenFromHeader(req);

  //gönderdiğimiz tokeni decode etmeye çalışıcak eğer süresi geçmişsse
  //ilk parametre olarak errorumuz doru olucak , geçmemişse decoded ,
  jwt.verify(accessToken, JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(
        new CustomError("You are not authorized to access this route", 401)
      );
    }
    console.log(decoded);
    req.user = {
      id: decoded.id,
      name: decoded.name,
    };
    // burada middlewareimizden routera iletim yapıyoruz.

    next();
  });
};
const getAdminAccess = asyncErrorWrapper(async (req, res, next) => {
  // önce yukarıdaki fonksiyondan geçti zaten
  const { id } = req.user;
  const user = await User.findById(id);
  if (user.role !== "admin") {
    return next(new CustomError("Only admins can access this route", 403));
  }
  next();
});
const getAnswerOwnerAccess = asyncErrorWrapper(async (req, res, next) => {
  const userId = req.user.id; // olay şu, eğer zaten ilk middleware'i geçerse user id oluşmuştur
  const answer_id = req.params.answer_id;
  const answer = await Answer.findById(answer_id); // awaitle beklemeyi unutma
  if (answer.user != userId) {
    return next(new CustomError("Only owner can handle this operation", 403));
  }

  next();
});
const getQuestionOwnerAccess = asyncErrorWrapper(async (req, res, next) => {
  const userId = req.user.id;
  const questionId = req.params.id;

  const question = await Question.findById(questionId);

  if (question.user != userId) {
    return next(new CustomError("Only owner can handle this operation", 403));
  }
  return next();
});

module.exports = {
  getAccessToRoute,
  getAdminAccess,
  getAnswerOwnerAccess,
  getQuestionOwnerAccess,
};
