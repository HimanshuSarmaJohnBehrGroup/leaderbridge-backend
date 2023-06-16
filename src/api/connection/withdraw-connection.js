const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Remove Answer
module.exports = exports = {
  // route handler
  handler: async ({ user, connectionId }) => {
    const userData = await utils.getHeaderFromToken(user);
    // console.log("Connection ID: ", connectionId);
    if (!connectionId) {
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
    }

    // console.log("User ID:connectionId", connectionId);
    try {
      let findConnection = await global.models.GLOBAL.CONNECTION.findById(
        connectionId
      );
      // console.log("findConnection: -----------", findConnection);
      if (findConnection) {
        const withdrawConnection =
          await global.models.GLOBAL.CONNECTION.findOneAndRemove({
            _id: connectionId,
            senderId: userData.id,
          });
        if (withdrawConnection) {
          const data4createResponseObject = {
            // req: req,
            result: 0,
            message: messages.CONNECTION_WITHDRAW,
            payload: {},
            logPayload: false,
          };
          return data4createResponseObject;
        } else {
          const data4createResponseObject = {
            // req: req,
            result: -1,
            message: messages.GENERAL,
            payload: {},
            logPayload: false,
          };
          return data4createResponseObject;
        }
      } else {
        const data4createResponseObject = {
          // req: req,
          result: -1,
          message: messages.NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        return data4createResponseObject;
      }
    } catch (error) {
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
    }
  },
};
