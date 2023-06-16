const mongoose = require("mongoose");
module.exports = (connection) => {
  const questionSchema = new mongoose.Schema({
    question: String,
    createdAt: { type: Date },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    filter: [
      {
        name: String,
        status: { type: Boolean, default: true },
        type: { type: String, default: "filter" },
        graphId: mongoose.Schema.Types.ObjectId,
        userId: mongoose.Schema.Types.ObjectId,
        image: String,
        color: { type: String },
        options: [
          {
            optionName: String,
            status: {
              type: Boolean,
              default: true,
            },
            orders: {
              type: Number,
              default: 0,
            },
            weight: {
              type: Number,
              default: 0,
            },
          },
        ],

        orders: {
          type: Number,
          default: 0,
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    displayProfile: { type: Boolean, default: false },
    allowConnectionRequest: { type: Boolean, default: false },
    view: { type: Number, default: 0 },
    response: { type: Number, default: 0 },
    status: { type: String, default: "active" },
    reportAbuse: { type: Boolean, default: false },
    share: { type: Boolean, default: false },
    experience: { type: String, default: null },
    dropdown: { type: String, default: null },
    group: { type: String, default: null },
    room: { type: Number, default: 0 },
    new: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
  });
  return connection.model("question", questionSchema, "question");
};
