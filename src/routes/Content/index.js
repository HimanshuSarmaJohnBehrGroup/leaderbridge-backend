const express = require("express");
const router = express.Router();
const api4Cms = require("../../api/Content/index");
const { validate } = require("../../middlewares");
const passport = require("passport");

// GET methods
router.get(
  "/get-content",
  // passport.authenticate(["jwt"], { session: false }),
  api4Cms.getCms.handler
);

router.get(
  "/get-content-value",
  // passport.authenticate(["jwt"], { session: false }),
  api4Cms.getConntent.handler
);

// POST Method

router.post(
  "/post-content-value",
  // passport.authenticate(["jwt"], { session: false }),
  api4Cms.postContent.handler
);
router.post(
  "/create-content",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4Cms.createCms.validation),
  api4Cms.createCms.handler
);

// PUT Method
router.put(
  "/update-content",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4Cms.updateCms.validation),
  api4Cms.updateCms.handler
);

// DELETE Method
router.delete(
  "/delete-content",
  passport.authenticate(["jwt"], { session: false }),
  api4Cms.deleteCms.handler
);

module.exports = exports = router;
