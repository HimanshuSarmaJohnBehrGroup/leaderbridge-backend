const express = require("express");
const router = express.Router();
const api4Plan = require("../../api/plan/index");
const { validate } = require("../../middlewares");
const passport = require("passport");

router.post(
  "/",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4Plan.addNewPlan.validation),
  api4Plan.addNewPlan.handler
);

router.put(
  "/:id",
  passport.authenticate(["jwt"], { session: false }),
  api4Plan.updatePlan.handler
);

router.get("/id=:id", api4Plan.getAllPlan.handler);

module.exports = exports = router;
