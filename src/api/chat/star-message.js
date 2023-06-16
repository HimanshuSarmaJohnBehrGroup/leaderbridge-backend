const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const ObjectId = require("mongodb").ObjectId;

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { star } = req.body;
    const { messageId, userId } = req.params;
    try {
      if (messageId) {
        let starMessage;
        if (star == true) {
          starMessage = await global.models.GLOBAL.CHAT.findByIdAndUpdate(
            {
              _id: messageId,
            },
            {
              $set: {
                isStar: true,
              },
              $push: { starredBy: userId },
            },
            {
              new: true,
            }
          );
        } else {
          starMessage = await global.models.GLOBAL.CHAT.findByIdAndUpdate(
            {
              _id: messageId,
            },
            {
              $set: {
                isStar: false,
              },
              $pull: { starredBy: userId },
            },
            {
              new: true,
            }
          );
        }
        if (!starMessage) {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.GENERAL,
            payload: {},
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.BAD_REQUEST)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: "MESSAGE STAR SUCCESSFULLY.",
            payload: { starMessage },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      }
    } catch (error) {
      logger.error(
        `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
      );
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
    }
  },
};
