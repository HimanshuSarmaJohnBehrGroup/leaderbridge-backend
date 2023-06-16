const { boolean } = require("joi");
const mongoose = require("mongoose");
module.exports = (connection) => {
  const answerSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId },
    answer: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    question: { type: mongoose.Schema.Types.ObjectId },
    isUpdated: { type: Boolean, default: false },
    createdAt: { type: Date },
    seenBy: { type: Array },
    sentTo: { type: Array },
    deliveredTo: { type: Array },
    updatedAt: { type: Date },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
    isUpdated: { type: Boolean, default: false },
    isAbuse: { type: Boolean, default: false },
    isStar: { type: Boolean, default: false },
    isGroup: { type: Boolean, default: false },
    status: { type: Number, default: 0 },
    isGroup: { type: Boolean, default: false },
    type: { type: String, default: "answer" },
    user_type: { type: String, default: "user" },
    tag: { type: Number, default: 0 },
    displayProfile: { type: Boolean, default: false },
  });
  return connection.model("answer", answerSchema, "answer");
};
