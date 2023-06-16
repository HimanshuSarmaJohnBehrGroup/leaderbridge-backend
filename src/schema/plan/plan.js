const mongoose = require("mongoose");
module.exports = (connection) => {
  const planSchema = new mongoose.Schema({
    planName: String,
    planDescription: String,
    planCost: Number,
    validity: Number,
    type: String,
    userType: String,
    preLaunch: String,
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
  });
  return connection.model("plan", planSchema, "plan");
};
