const express = require("express");
const router = express.Router();
const dropdown = require("../../api/dropdown/index");
const { validate } = require("../../middlewares");
const passport = require("passport");

// GET methods

// POST Method

router.get(
  "/getdropdown",
  //   passport.authenticate(["jwt"], { session: false }),
  dropdown.getdropdown.handler
);

router.post(
  "/adddropdown",
  //   passport.authenticate(["jwt"], { session: false }),
  dropdown.adddropdown.handler
);

router.delete(
  "/delete-dropdown",
  //   passport.authenticate(["jwt"], { session: false }),
  dropdown.deleteDropdown.handler
);

router.put(
  "/update-dropdown",
  //   passport.authenticate(["jwt"], { session: false }),
  //   validate("body", api4Cms.updateCms.validation),
  dropdown.updateDropdown.handler
);

module.exports = exports = router;
