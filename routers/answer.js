const express = require("express");

const router = express.Router({ mergeParams: true });
const { getAccessToRoute } = require("../middlewares/authorization/auth");
const {
  addNewAnswerToQuestion,
  getAllAnswersByQuestion,
  getSingleAnswer,
  editAnswer,
  deleteAnswer,
  likeAnswer,
  undolikeAnswer,
} = require("../controllers/answer");
const {
  checkQuestionAndAnswerExist,
} = require("../middlewares/databases/databaseErrorHelpers");
const { getAnswerOwnerAccess } = require("../middlewares/authorization/auth");
const { undolikeQuestion } = require("../controllers/question");
router.post("/", getAccessToRoute, addNewAnswerToQuestion);

router.get("/", getAllAnswersByQuestion);
router.get("/:answer_id", checkQuestionAndAnswerExist, getSingleAnswer);
router.get(
  "/:answer_id/like",
  [checkQuestionAndAnswerExist, getAccessToRoute],
  likeAnswer
);
router.get(
  "/:answer_id/undo_like",
  [checkQuestionAndAnswerExist, getAccessToRoute],
  undolikeAnswer
);

router.get("/:answer_id", checkQuestionAndAnswerExist, getSingleAnswer);
router.put(
  "/:answer_id/edit",
  [checkQuestionAndAnswerExist, getAccessToRoute, getAnswerOwnerAccess],
  editAnswer
);
router.delete(
  "/:answer_id/delete",
  [checkQuestionAndAnswerExist, getAccessToRoute, getAnswerOwnerAccess],
  deleteAnswer
);
module.exports = router;
