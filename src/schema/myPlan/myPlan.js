const mongoose = require("mongoose");
module.exports = (connection) => {
  const planSchema = new mongoose.Schema(
    {
      uid: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
      pid: { type: mongoose.Schema.Types.ObjectId, ref: "plan" },
      paymentId: String,
      planCost: Number,
      validity: Date,
      startDate: Date,
      planduration: String,
      userpurchasing: String,
      userStatus: String,
      PaymentVerified: String,
    },
    {
      timestamps: true,
    }
  );
  return connection.model("myPlan", planSchema, "myPlan");
};
