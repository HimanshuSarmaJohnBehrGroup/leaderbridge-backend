const express = require("express");
const router = express.Router();
const api4MyPlan = require("../../api/myPlan/index");
const { validate } = require("../../middlewares");
const passport = require("passport");

router.post(
  "/",
  // passport.authenticate(["jwt"], { session: false }),
  validate("body", api4MyPlan.addNewMyPlan.validation),
  api4MyPlan.addNewMyPlan.handler
);

router.get(
  "/",
  passport.authenticate(["jwt"], { session: false }),
  api4MyPlan.getAllMyPlan.handler
);

module.exports = exports = router;
