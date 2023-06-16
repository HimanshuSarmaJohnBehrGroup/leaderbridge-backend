const express = require("express");
const router = express.Router();
const api4Connection = require("../../api/connection/index");
const passport = require("passport");

// GET Method
router.get(
  "/",
  passport.authenticate(["jwt"], { session: false }),
  api4Connection.getConnection.handler
);

router.get(
  "/conected",
  passport.authenticate(["jwt"], { session: false }),
  api4Connection.getConnected.handler
);

// PUT Method
router.put(
  "/id=:receiverId",
  passport.authenticate(["jwt"], { session: false }),
  api4Connection.acceptConnection.handler
);
router.put(
  "/decline/id=:senderId",
  passport.authenticate(["jwt"], { session: false }),
  api4Connection.diclineConnection.handler
);
router.put(
  "/remove/id=:removeId",
  passport.authenticate(["jwt"], { session: false }),
  api4Connection.removeConnection.handler
);

// POST Method
router.post(
  "/id=:receiverId",
  passport.authenticate(["jwt"], { session: false }),
  api4Connection.addConnection.handler
);

// DELETE Method
router.delete(
  "/id=:connectionId",
  passport.authenticate(["jwt"], { session: false }),
  api4Connection.withdrawConnection.handler
);

module.exports = exports = router;
