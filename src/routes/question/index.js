const express = require("express");
const router = express.Router();
const api4Question = require("../../api/question/index");
const { validate } = require("../../middlewares");
const passport = require("passport");

// GET Method
router.get(
  "/get-question",
  passport.authenticate(["jwt"], { session: false }),
  api4Question.getQuestion.handler
);

router.get(
  "/get-question-answer/id=:question",
  passport.authenticate(["jwt"], { session: false }),
  api4Question.getQuestionByAnswer.handler
);

router.get(
  "/get-question-admin",
  passport.authenticate(["jwt"], { session: false }),
  api4Question.getQuestionAdmin.handler
);

router.get("/get-question-By-me", api4Question.QuestionRoom.handler);

router.get(
  "/get-question-admin-all",
  passport.authenticate(["jwt"], { session: false }),
  api4Question.getQuestionAdminAll.handler
);

router.get(
  "/reported-question",
  passport.authenticate(["jwt"], { session: false }),
  api4Question.getReportedQuestion.handler
);

// POST Method
router.post(
  "/create-question",
  passport.authenticate(["jwt"], { session: false }),
  api4Question.createQuestion.handler
);

router.post(
  "/create-question-share",
  passport.authenticate(["jwt"], { session: false }),
  api4Question.createQuestionShare.handler
);
router.post(
  "/filter",
  passport.authenticate(["jwt"], { session: false }),
  api4Question.questionWithFilter.handler
);
router.post(
  "/report/id=:questionId",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4Question.reportQuestion.validation),
  api4Question.reportQuestion.handler
);
router.post(
  "/accept-reported-question",
  passport.authenticate(["jwt"], { session: false }),
  api4Question.acceptReportedQuestion.handler
);

router.get(
  "/remove-dummy-user",
  // passport.authenticate(["jwt"], { session: false }),
  api4Question.RemoveDummyUser.handler
);

// PUT Method
router.put(
  "/update-question",
  passport.authenticate(["jwt"], { session: false }),
  api4Question.updateQuestion.handler
);
router.put(
  "/id=:questionId",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4Question.questionUpdate.validation),
  api4Question.questionUpdate.handler
);
router.put(
  "/remove/id=:questionId",
  passport.authenticate(["jwt"], { session: false }),
  api4Question.removeForUser.handler
);
router.put(
  "/report/id=:questionId",
  passport.authenticate(["jwt"], { session: false }),
  api4Question.acceptAbuse.handler
);
router.put(
  "/decline/id=:questionId",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4Question.declineRequest.validation),
  api4Question.declineRequest.handler
);

// DELETE METHOD
router.delete(
  "/:questionId",
  passport.authenticate(["jwt"], { session: false }),
  api4Question.deletedQuestion.handler
);

router.get(
  "/search-question",
  passport.authenticate(["jwt"], { session: false }),
  api4Question.searchQuestion.handler
);

module.exports = exports = router;
