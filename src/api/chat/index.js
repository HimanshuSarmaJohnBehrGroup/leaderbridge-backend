const getAllChat = require("./get-all-chat");
const sendMessage = require("./send-message");
const getRoom = require("./get-room");
const initiateChat = require("./initiate-chat");
const getMessages = require("./get-messages");
const getAnswerMessage = require("./get-answer-message");
const history = require("./get-history");
const lastMessage = require("./get-last-message");
const starMesssage = require("./star-message");
const updateMessage = require("./update-message");
const muteRoom = require("./mute-chat-room");
const unMuteRoom = require("./unmute-chat-room");
const requestProfile = require("./request-profile");
const unreadCount = require("./get-unread-message-count");
const allChatRoom = require("./get-all-chat-room");
const acceptRequest = require("./accept-request");
const declineRequest = require("./decline-profile-access-request");
const chatnotification = require("./get-chat-notification");

module.exports = exports = {
  getAllChat,
  sendMessage,
  getRoom,
  initiateChat,
  getMessages,
  getAnswerMessage,
  history,
  lastMessage,
  starMesssage,
  updateMessage,
  muteRoom,
  unMuteRoom,
  requestProfile,
  unreadCount,
  allChatRoom,
  acceptRequest,
  declineRequest,
  chatnotification,
  getAnswerMessage,
};
