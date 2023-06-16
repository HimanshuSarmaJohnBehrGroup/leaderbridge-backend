const express = require("express");
const router = express.Router();
const api4Legend = require("../../api/legends/index");
const { validate } = require("../../middlewares");
const passport = require("passport");
const { serviceImageUploadS3 } = require("../../utils");

// GET Method
router.get("/", api4Legend.getLegends.handler);

// POST Method
router.post(
  "/create",
  serviceImageUploadS3.single("profileImage"),
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4Legend.legendsCreate.validation),
  api4Legend.legendsCreate.handler
);

// PUT method
router.put(
  "/id=:id",
  serviceImageUploadS3.single("profileImage"),
  passport.authenticate(["jwt"], { session: false }),
  api4Legend.updateLegend.handler
);

// DELETE method
router.delete(
  "/:id",
  passport.authenticate(["jwt"], { session: false }),
  api4Legend.deleteLegend.handler
);

module.exports = exports = router;
