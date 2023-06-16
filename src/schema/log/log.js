const mongoose = require("mongoose");
module.exports = (connection) => {
  const schema = new mongoose.Schema(
    {
      description: { type: String, required: true },
      request: {
        id: String,
        body: Object,
        headers: Object,
        ip: String,
        method: String,
        path: String,
        protocol: String,
        userAgent: String,
      },
      server: {
        hostname: String,
        networkInterfaces: Array,
      },
      time: { type: Date, required: true },
    },
    {
      autoCreate: true,
    }
  );

  // return logsSchema;
  return connection.model("log", schema, "log");
};
