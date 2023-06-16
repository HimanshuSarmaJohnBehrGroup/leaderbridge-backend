const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const { getHeaderFromToken } = require("../../utils");
const utils = require("../../utils");

// Retrieve and return all Answer from the database.
module.exports = exports = {
  // route handler
  handler: async ({ user, received, sent }) => {
    // const { user } = req;
    // const { sent } = req.query;
    // const { received } = req.query;

    // console.log("ffffffffffff-----", user);
    // console.log("ffffffffffff-----sent", sent);
    const userData = await getHeaderFromToken(user);
    // // console.log("DDDDDDDDDDDDDDDDDDDffffffffffff-----", userData);
    // // console.log("DDDDDDDDDDDDDDDDDDDffffffffffff-----received", received);
    // // console.log("DDDDDDDDDDDDDDDDDDDffffffffffff-----sent", sent);

    try {
      // let findConnection;
      if (sent) {
        let findConnectionData = await global.models.GLOBAL.CONNECTION.find({
          senderId: userData.id,
        })
          .populate({
            path: "receiverId",
            model: "user",
            select: "_id name email profileImage region currentRole subject",
          })
          .sort({
            requestedAt: -1,
          });
        // console.log("findConnection==========", findConnection);
        const data4createResponseObject = {
          // req: req,
          result: 0,
          message: messages.SUCCESS,
          payload: { findConnectionData },
          logPayload: false,
        };
        // console.log("Data---------", data4createResponseObject);
        return data4createResponseObject;
      } else if (received) {
        let findConnection = await global.models.GLOBAL.CONNECTION.find({
          receiverId: userData.id,
        })
          .populate({
            path: "senderId",
            model: "user",
            select: "_id name email profileImage region currentRole subject",
          })
          .sort({
            requestedAt: -1,
          });

        const data4createResponseObject = {
          // req: req,
          result: 0,
          message: messages.SUCCESS,
          payload: { findConnection },
          logPayload: false,
        };
        // console.log("Data---------", data4createResponseObject);
        return data4createResponseObject;
      }

      // res
      //   .status(enums.HTTP_CODES.OK)
      //   .json(utils.createResponseObject(data4createResponseObject));
    } catch (error) {
      logger.error(
        `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
      );
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
