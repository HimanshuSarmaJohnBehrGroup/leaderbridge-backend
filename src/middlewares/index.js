const handleSensitiveRequestParameters = require("./handle-sensitive-request-parameters");
const logIncomingRequest = require("./log-incoming-request");
const validate = require("./validate");
const JWTHelper = require("./jwt-middleware");

module.exports = exports = {
  cors: async (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "DELETE, GET, OPTIONS, POST, PUT"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type, Origin, X-Requested-With"
    );
    next();
  },
  handleSensitiveRequestParameters,
  logIncomingRequest,
  validate,
  JWTHelper,
};
