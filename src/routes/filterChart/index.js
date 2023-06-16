const express = require("express");
const router = express.Router();
const apiGraph = require("../../api/filterchart/index.js");
const passport = require("passport");
const { serviceImageUploadS3 } = require("../../utils.js");

// POST Method
router.post(
  "/add-graph",
  // passport.authenticate(["jwt"], { session: false }),
  apiGraph.addGraph.handler
);

router.get(
  "/get-graph",
  // passport.authenticate(["jwt"], { session: false }),
  apiGraph.getGraph.handler
);

router.get(
  "/get-graph-user",
  // passport.authenticate(["jwt"], { session: false }),
  apiGraph.getGraphUser.handler
);

router.put(
  "/update-graph-user",
  // passport.authenticate(["jwt"], { session: false }),
  serviceImageUploadS3.single("profileImage"),
  apiGraph.UpdateGraphUser.handler
);

router.put(
  "/add-graph-option",
  passport.authenticate(["jwt"], { session: false }),
  apiGraph.addOptions.handler
);

module.exports = exports = router;
