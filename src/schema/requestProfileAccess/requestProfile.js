const mongoose = require("mongoose");
module.exports = (connection) => {
  const requestProfileSchema = new mongoose.Schema({
    requestBy: { type: mongoose.Schema.Types.ObjectId, refPath: "user" },
    requestTo: { type: mongoose.Schema.Types.ObjectId, refPath: "user" },
    createdAt: { type: Date },
    updatedAt: { type: Date, default: Date.now() },
    status: { type: String, default: "pending" },
    groupStatus: { type: Number, default: 0 },
    questionId: { type: mongoose.Schema.Types.ObjectId },
    acceptedAT: { type: Date },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, refPath: "user" },
    roomId: { type: mongoose.Schema.Types.ObjectId },
    typeOfRequest: { type: String, default: "requestProfileAccess" },
    owner: { type: String },
  });
  // return chat Schema;
  return connection.model(
    "requestProfile",
    requestProfileSchema,
    "requestProfile"
  );
};
