const mongoose = require("mongoose");
module.exports = (connection) => {
  const filterSchema = new mongoose.Schema({
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
  });
  return connection.model("userGraph", filterSchema, "userGraph");
};
