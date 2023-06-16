const express = require("express");
const router = express.Router();
const api4Cms = require("../../api/cms/index");
const { validate } = require("../../middlewares");
const passport = require("passport");

// GET methods
router.get(
  "/get-cms",
  // passport.authenticate(["jwt"], { session: false }),
  api4Cms.getCms.handler
);

// POST Method
router.post(
  "/create-cms",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4Cms.createCms.validation),
  api4Cms.createCms.handler
);

// PUT Method
router.put(
    "/update-cms",
    passport.authenticate(["jwt"], { session: false }),
    validate("body", api4Cms.updateCms.validation),
    api4Cms.updateCms.handler
);

// DELETE Method
router.delete(
    "/delete-cms",
    passport.authenticate(["jwt"], { session: false }),
    api4Cms.deleteCms.handler
);


module.exports = exports = router;
