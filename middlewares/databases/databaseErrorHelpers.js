const User = require("../../models/User");
const Question = require("../../models/Question");
const CustomError = require("../../helpers/error/customError");
const asyncErrorWrapper = require("express-async-handler");
const Answer = require("../../models/Answer");
const checkUserExist = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return next(new CustomError("There is no such user with that id", 400));
  }
  req.data = user;
  next();
  //artık getSingleUserda vs veya her yerde userı controllerın içinde kontrol etmek zorunda değiliz
  //bunu biz middleware ile hallediyoruz.
});
const checkQuestionExist = asyncErrorWrapper(async (req, res, next) => {
  const id = req.params.id || req.params.question_id;
  const question = await Question.findById(id);
  console.log(question);
  if (!question) {
    return next(new CustomError("There is no such question with that id", 400));
  }
  next();
  //artık getSingleUserda vs veya her yerde userı controllerın içinde kontrol etmek zorunda değiliz
  //bunu biz middleware ile hallediyoruz.
});
// Bunu yazdık çünkü o soru ve answer var mı diye middleware yazmak istedik.
const checkQuestionAndAnswerExist = asyncErrorWrapper(
  async (req, res, next) => {
    const question_id = req.params.question_id;
    const answer_id = req.params.answer_id;
    const answer = await Answer.findOne({
      _id: answer_id,
      question: question_id,
    });
    if (!answer) {
      return next(new CustomError("There is no such answer with that id", 400));
    }
    next();
    //artık getSingleUserda vs veya her yerde userı controllerın içinde kontrol etmek zorunda değiliz
    //bunu biz middleware ile hallediyoruz.
  }
);

module.exports = {
  checkUserExist,
  checkQuestionExist,
  checkQuestionAndAnswerExist,
};
