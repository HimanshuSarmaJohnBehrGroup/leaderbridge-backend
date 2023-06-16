const mongoose = require("mongoose");
module.exports = (connection) => {
  const answerSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "chat_room" },
    sender: { type: mongoose.Schema.Types.ObjectId, refPath: "user" },
    message: { type: String },
    isStar: { type: Boolean, default: false },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    isUpdated: { type: Boolean, default: false },
    status: { type: Number, default: 0 },
  });
  // return answer Schema;
  return connection.model("answer", answerSchema, "answer");
};
