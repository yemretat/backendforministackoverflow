const Question = require("../models/Question");
const CustomError = require("../helpers/error/customError");
const asyncErrorWrapper = require("express-async-handler");
const questionQueryMiddleware = require("../middlewares/query/questionQueryMiddleware");
const getAllQuestions = asyncErrorWrapper(async (req, res, next) => {
  return res.status(200).json(res.queryResult);
  // let query = Question.find(); //.where({ title:"Questions 3 - Title"})
  // const populate = true;
  // const populateObject = { path: "user", select: "name profile_image" };
  // // Serach
  // if (req.query.search) {
  //   const searchObject = {};
  //   const regex = new RegExp(req.query.search, "i");
  //   searchObject["title"] = regex; // burada title'ı regexli halini arıyoruz
  //   query = query.where(searchObject);
  // }
  // //Populate
  // if (populate) {
  //   query = query.populate(populateObject);
  // }
  // //pagination
  // const page = parseInt(req.query.page) || 1;
  // const limit = parseInt(req.query.limit) || 5;

  // const startIndex = (page - 1) * limit;
  // const enddIndex = page * limit;

  // const pagination = {};
  // const total = await Question.countDocuments();
  // if (startIndex > 0) {
  //   pagination.previous = {
  //     page: page - 1,
  //     limit: limit,
  //   };
  // }
  // if (enddIndex < total) {
  //   pagination.next = {
  //     page: page + 1,
  //     limit: limit,
  //   };
  // }
  // query = query.skip(startIndex).limit(limit);

  // const sortKey = req.query.sortBy;
  // if (sortKey == "most-answered") {
  //   query = query.sort("-answerCount  -createdAt"); //başa eksi koyduk yani büyükten küçüğe
  // }
  // if (sortKey == "most-liked") {
  //   query = query.sort("-likeCount -createdAt"); // eğer likeCountları aynıysa en erken create olan
  // } else {
  //   query = query.sort("-createdAt");
  // }
  // const questions = await query;
});

const getSingleQuestion = asyncErrorWrapper(async (req, res, next) => {
  return res.status(200).json(res.queryResults);
});
const askNewQuestion = asyncErrorWrapper(async (req, res, next) => {
  const information = req.body; // requesti alıyoruz userid de ekleyip create'le
  const question = await Question.create({
    //information bu tarz veriş hatalı
    ...information, //tüm alanları direkt olarak vermek isterseniz.Split operatörü
    user: req.user.id,
  });
  res.status(200).json({
    success: true,
    message: question,
  });
});
const editQuestion = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { title, content } = req.body;
  console.log(title);
  let question = await Question.findById(id); // questionı değiştireceğiz diye let ile aldım
  question.title = title;
  question.content = content;
  question = await question.save();
  return res.status(200).json({
    success: true,
    data: question,
  });
});
const deleteQuestion = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  await Question.findByIdAndDelete(id);
  res.status(200).json({
    success: true,
    message: "Question delete operation successful",
  });
});
const likeQuestion = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  const question = await Question.findById(id);
  if (question.likes.includes(req.user.id)) {
    // eğer şuanki soruda like yapanlar giriş yapmış kullanıcının idsini içeriyorsa
    return next(new CustomError("You already liked this question", 400));
  }
  question.likes.push(req.user.id);
  question.likeCount = question.likes.length;

  await question.save();
  res.status(200).json({
    success: true,
    message: "Question like operation successful",
    data: question,
  });
});
const undolikeQuestion = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  const question = await Question.findById(id);
  if (!question.likes.includes(req.user.id)) {
    // eğer şuanki soruda like yapanlar giriş yapmış kullanıcının idsini içeriyorsa
    return next(
      new CustomError("You cannot undo like operation for this question", 400)
    );
  }
  const index = question.likes.indexOf(req.user.id); // indexi bul
  question.likes.splice(index, 1); //like edilenlerden o indextekini çıkar
  question.likeCount = question.likes.length;
  await question.save();
  res.status(200).json({
    success: true,
    message: "Question undolike operation successful",
    data: question,
  });
});
module.exports = {
  getAllQuestions,
  askNewQuestion,
  getSingleQuestion,
  editQuestion,
  deleteQuestion,
  likeQuestion,
  undolikeQuestion,
};
