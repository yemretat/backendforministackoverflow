const CustomError = require("../helpers/error/customError");
const asyncErrorWrapper = require("express-async-handler");
const Answer = require("../models/Answer");
const Question = require("../models/Question");

const addNewAnswerToQuestion = asyncErrorWrapper(async (req, res, next) => {
  const { question_id } = req.params;
  const user_id = req.user.id;
  const information = req.body;
  const answer = await Answer.create({
    ...information, // buradan content falan gelecek
    question: question_id,
    user: user_id,
  });
  return res.status(200).json({
    success: true,
    data: answer,
  });
});
const getAllAnswersByQuestion = asyncErrorWrapper(async (req, res, next) => {
  const { question_id } = req.params;

  const question = await Question.findById(question_id).populate("answers");
  // populate işi şöyle biz questiondan referans verdik answera. O da gitti questionda answer idlerini getirmektense

  const answers = question.answers;
  return res.status(200).json({
    success: true,
    count: answers.length,
    data: answers,
  });
});
const getSingleAnswer = asyncErrorWrapper(async (req, res, next) => {
  const { answer_id } = req.params;
  const answer = await Answer.findById(answer_id)
    .populate({
      path: "question",
      select: "title",
    })
    .populate({
      path: "user",
      //select: "name profile_image", //name ve profile_image bilgisi geldi.
    });
  return res.status(200).json({
    success: true,
    data: answer,
  });
});
const editAnswer = asyncErrorWrapper(async (req, res, next) => {
  const { answer_id } = req.params;

  const { content } = req.body;
  let answer = await Answer.findById(answer_id);
  answer.content = content;
  answer = await answer.save();
  return res.status(200).json({
    success: true,
    data: answer,
  });
});

const deleteAnswer = asyncErrorWrapper(async (req, res, next) => {
  const { answer_id } = req.params;
  const { question_id } = req.params;
  await Answer.findByIdAndRemove(answer_id); // answerlardan bulup kaldırdık
  const question = await Question.findById(question_id); // burada questionlardan bulduk ve aşağıda
  // o questionların içindeki answerlardan kaldırıcaz
  question.answers.splice(question.answers.indexOf(answer_id), 1);
  //arraydaki indexini bulup sildik!
  question.answerCount = question.answer.length;
  await question.save();
  return res.status(200).json({
    success: true,
    message: "Answer Deleted Successfully! ",
  });
});
const likeAnswer = asyncErrorWrapper(async (req, res, next) => {
  const { answer_id } = req.params;
  const answer = await Answer.findById(answer_id);
  if (answer.likes.includes(req.user.id)) {
    // eğer şuanki soruda like yapanlar giriş yapmış kullanıcının idsini içeriyorsa
    return next(new CustomError("You already liked this answer", 400));
  }
  answer.likes.push(req.user.id);
  await answer.save();
  res.status(200).json({
    success: true,
    message: "Answer like operation successful",
    data: answer,
  });
});
const undolikeAnswer = asyncErrorWrapper(async (req, res, next) => {
  const { answer_id } = req.params;
  const answer = await Answer.findById(id);
  if (!answer.likes.includes(req.user.id)) {
    // eğer şuanki soruda like yapanlar giriş yapmış kullanıcının idsini içeriyorsa
    return next(
      new CustomError("You cannot undo like operation for this answer", 400)
    );
  }
  const index = answer.likes.indexOf(req.user.id); // indexi bul
  answer.likes.splice(index, 1); //like edilenlerden o indextekini çıkar
  await answer.save();
  res.status(200).json({
    success: true,
    message: "Answer undolike operation successful",
    data: answer,
  });
});
module.exports = {
  addNewAnswerToQuestion,
  getAllAnswersByQuestion,
  getSingleAnswer,
  editAnswer,
  deleteAnswer,
  undolikeAnswer,
  likeAnswer,
};
// burada sadece oluşturdul ilgili id'yi questiona ekleme modelin içinde olacak
