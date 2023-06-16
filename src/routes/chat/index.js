const express = require("express");
const router = express.Router();
const chatApi = require("../../api/chat");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Get Methods
router.get(
  "/get-all-chat",
  passport.authenticate(["jwt"], { session: false }),
  chatApi.getAllChat.handler
);
router.get(
  "/get-messages",
  passport.authenticate(["jwt"], { session: false }),
  validate("query", chatApi.getMessages.validation),
  chatApi.getMessages.handler
);
router.get(
  "/get-last-message",
  passport.authenticate(["jwt"], { session: false }),
  chatApi.lastMessage.handler
);
router.get(
  "/unread",
  passport.authenticate(["jwt"], { session: false }),
  chatApi.unreadCount.handler
);

// Post Methods
router.post(
  "/send-message",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", chatApi.sendMessage.validation),
  chatApi.sendMessage.handler
);
router.post(
  "/initiate-chat",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", chatApi.initiateChat.validation),
  chatApi.initiateChat.handler
);

// Put Methods
router.put(
  "/star/id=:messageId/userId=:userId",
  passport.authenticate(["jwt"], { session: false }),
  chatApi.starMesssage.handler
);
router.put(
  "/id=:messageId",
  passport.authenticate(["jwt"], { session: false }),
  chatApi.updateMessage.handler
);
router.put(
  "/mute/id=:roomId",
  passport.authenticate(["jwt"], { session: false }),
  chatApi.muteRoom.handler
);
router.put(
  "/un-mute/id=:roomId",
  passport.authenticate(["jwt"], { session: false }),
  chatApi.unMuteRoom.handler
);
module.exports = exports = router;
