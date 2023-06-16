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
      },
    ],
    multiSelect: {
      type: Boolean,
      default: false,
    },
    profileHide: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    orders: {
      type: Number,
      default: 0,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  return connection.model("filter", filterSchema, "filter");
};
