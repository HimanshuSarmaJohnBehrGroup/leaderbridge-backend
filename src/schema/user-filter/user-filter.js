const { string } = require("joi");
const mongoose = require("mongoose");
module.exports = (connection) => {
  const filterSchema = new mongoose.Schema({
    filterTypeId: mongoose.Schema.Types.ObjectId,
    name: String,
    status: { type: Boolean, default: true },
    options: [
      {
        optionId: mongoose.Schema.Types.ObjectId,
        optionName: String,
        status: Boolean,
        optional: {
          type: Boolean,
          default: false,
        },
        optionalInput: {
          type: String,
        },
        required: {
          type: Boolean,
          default: false,
        },
      },
    ],
    userId: mongoose.Schema.Types.ObjectId,
    filterId: mongoose.Schema.Types.ObjectId,
    displayProfile: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    orders: {
      type: Number,
      default: 0,
    },
    profileHide: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    multiSelect: Boolean,
  });
  return connection.model("user_filter", filterSchema, "user_filter");
};
