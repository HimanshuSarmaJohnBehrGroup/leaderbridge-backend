const mongoose = require("mongoose");
module.exports = (connection) => {
  const answerRoomSchema = new mongoose.Schema({
    participateIds: [],
    questionId: { type: mongoose.Schema.Types.ObjectId },
    isGroup: { type: Boolean, default: true },
    createdAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    lastMessage: {
      createdAt: { type: Date },
      answerId: { type: mongoose.Schema.Types.ObjectId },
      answer: String,
    },
    isActive: { type: Boolean, default: true },
  });

  return connection.model("answer_group", answerRoomSchema, "answer_group");
};
