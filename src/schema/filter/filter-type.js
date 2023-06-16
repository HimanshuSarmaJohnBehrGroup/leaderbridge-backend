const mongoose = require("mongoose");
module.exports = (connection) => {
  const filterTypeSchema = new mongoose.Schema({
    name: String,
    intent: String,
  });
  return connection.model("filterType", filterTypeSchema, "filterType");
};
