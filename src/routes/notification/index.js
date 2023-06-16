const express = require("express");
const router = express.Router();
const api4Notification = require("../../api/notification/index");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Get Methods
router.get(
  "/active",
  passport.authenticate(["jwt"], { session: false }),
  api4Notification.getAllNotification.handler
);
router.get(
  "/",
  passport.authenticate(["jwt"], { session: false }),
  api4Notification.getNotificationCount.handler
);

// Put Methods
router.put(
  "/:id",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4Notification.updateNotification.validation),
  api4Notification.updateNotification.handler
);

module.exports = exports = router;
