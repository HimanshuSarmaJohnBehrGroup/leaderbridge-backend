const mongoose = require("mongoose");
module.exports = (connection) => {
  const chatSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "chat_room" },
    sender: { type: mongoose.Schema.Types.ObjectId, refPath: "user" },
    message: { type: String },
    messageType: { type: String },
    type: { type: String },
    attach: { type: String },
    seenBy: { type: Array },
    sentTo: { type: Array },
    deliveredTo: { type: Array },
    isActive: { type: Boolean, default: true },
    isStar: { type: Boolean, default: false },
    starredBy: { type: Array },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    isUpdated: { type: Boolean, default: false },
    status: { type: Boolean, default: false },
    parentMessageId: { type: mongoose.Schema.Types.ObjectId, default: null },
  });

  // return chat Schema;
  return connection.model("chat", chatSchema, "chat");
};
