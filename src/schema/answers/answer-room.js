const mongoose = require("mongoose");
module.exports = (connection) => {
  const answerRoomSchema = new mongoose.Schema({
    participateIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date },
    updatedAt: { type: Date, default: Date.now() },
  });

  // return chat Schema;
  return connection.model("answer_room", answerRoomSchema, "answer_room");
};
