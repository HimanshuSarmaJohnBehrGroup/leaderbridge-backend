const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const ObjectId = require("mongodb").ObjectId;

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  //  route validation
  validation: Joi.object({
    roomId: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    const { roomId } = req;
    const { user } = req;

    try {
      let chats = await global.models.GLOBAL.CHAT.find({
        roomId: roomId,
      })
        .populate({
          path: "sender",
          model: "user",
          select: "name subject profileImage currentRole",
        })
        .populate({
          path: "parentMessageId",
          model: "chat",
          select: "roomId sender message messageType type createdAt updatedAt",
        });

      if (chats) {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.MESSAGES_FETCH_SUCCESS,
          payload: { chats },
          logPayload: false,
        };
        return data4createResponseObject;
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
