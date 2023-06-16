const mongoose = require("mongoose");
module.exports = (connection) => {
  const content = new mongoose.Schema({
    title: String,
    description: String,
    isActive: { type: Boolean, default: true },
    userId: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date },
    updatedAt: { type: Date, default: Date.now },
  });
  return connection.model("content", content, "content");
};
