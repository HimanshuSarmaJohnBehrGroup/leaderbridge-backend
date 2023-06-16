const mongoose = require("mongoose");
module.exports = (connection) => {
  const ShareQuestion = new mongoose.Schema({
    question: String,
    createdAt: { type: Date },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    displayProfile: { type: Boolean, default: false },
    allowConnectionRequest: { type: Boolean, default: false },
    view: { type: Number, default: 0 },
    response: { type: Number, default: 0 },
    status: { type: String, default: "active" },
    reportAbuse: { type: Boolean, default: false },
    experience: { type: String, default: null },
    dropdown: { type: String, default: null },
  });
  return connection.model("shareQuestion", ShareQuestion, "shareQuestion");
};
