const express = require("express");
const router = express.Router();
const answer = require("./answer");
const Question = require("../models/Question");
const {
  getAllQuestions,
  getSingleQuestion,
  askNewQuestion,
  editQuestion,
  deleteQuestion,
  likeQuestion,
  undolikeQuestion,
} = require("../controllers/question");
const {
  checkQuestionExist,
} = require("../middlewares/databases/databaseErrorHelpers");
// kullanıcı kayıt yapmış olması lazım
const {
  getAccessToRoute,
  getQuestionOwnerAccess,
} = require("../middlewares/authorization/auth");
const questionQueryMiddleware = require("../middlewares/query/questionQueryMiddleware");
const answerQueryMiddleware = require("../middlewares/query/answerQueryMiddleware");

router.get(
  "/",
  questionQueryMiddleware(Question, {
    array: "answers",
    population: [
      {
        path: "user",
        select: "name profile_image",
      },
      {
        path: "answers",
        populate: {
          path: "user",
        },

        select: "content user",
      },
    ],
  }),
  getAllQuestions
);
//bunlar request handlerlardır (req,res yazılan) req olduğunda req geliyor , responesunu döndüreceğinde
// response dönüyor next de express tarafından gönderiliyor
router.get("/register", (req, res) => {
  res.send("Questions register Page");
});
router.get("/:id/like", [getAccessToRoute, checkQuestionExist], likeQuestion);
router.get(
  "/:id/undo_like",
  [getAccessToRoute, checkQuestionExist],
  undolikeQuestion
);

router.get(
  "/:id",
  checkQuestionExist,
  answerQueryMiddleware(Question),
  getSingleQuestion
);
router.post("/ask", getAccessToRoute, askNewQuestion);
router.put(
  "/:id/edit",
  [getAccessToRoute, checkQuestionExist, getQuestionOwnerAccess],
  editQuestion
);
router.delete(
  "/:id/delete",
  [getAccessToRoute, checkQuestionExist, getQuestionOwnerAccess],
  deleteQuestion
);
router.use("/:question_id/answers", checkQuestionExist, answer);
//res.status , res.send , res.json her şeyi kullanabilirsin

module.exports = router;
