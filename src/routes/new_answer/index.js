const express = require("express");
const router = express.Router();
const api4NewAnswer = require("../../api/new_answer/index");
const { validate } = require("../../middlewares");
const passport = require("passport");

//Put Method
router.put(
  "/star/id=:answerId",
  passport.authenticate(["jwt"], { session: false }),
  api4NewAnswer.starAnswer.handler
);

// Post Methods
router.post(
  "/init",
  passport.authenticate(["jwt"], { session: false }),
  // validate("body", api4NewAnswer.initAnsweRoom.validation),
  api4NewAnswer.initAnsweRoom.handler
);

//Delete Method
router.delete(
  "/id=:answerId",
  passport.authenticate(["jwt"], { session: false }),
  api4NewAnswer.removeAnswer.handler
);
module.exports = exports = router;
