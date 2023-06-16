const mongoose = require("mongoose");
module.exports = (connection) => {
  const chatRoomSchema = new mongoose.Schema({
    participateIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date },
    updatedAt: { type: Date, default: Date.now() },
    mutedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    unknownName: { type: String, default: null },
    lastMessage: {
      messageId: { type: mongoose.Schema.Types.ObjectId },
      message: String,
      createdAt: { type: Date },
    },
    matchingRoom: { type: Boolean, default: false },
  });

  // return chat Schema;
  return connection.model("chat_room", chatRoomSchema, "chat_room");
};
