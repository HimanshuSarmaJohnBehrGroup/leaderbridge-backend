const mongoose = require("mongoose");
module.exports = (connection) => {
  const verificationStatus = new mongoose.Schema({
    DocumentType: { type: String },
    Country: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    status: { type: Boolean, default: false },
    user_image: { type: String },
    accept: { type: Boolean, default: false },
    reject: { type: Boolean, default: false },
    document_image_front: { type: String },
    document_image_back: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  return connection.model(
    "verificationStatus",
    verificationStatus,
    "verificationStatus"
  );
};
