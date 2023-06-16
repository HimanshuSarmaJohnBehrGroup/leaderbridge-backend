const { ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");

const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { message } = req.body;
    const { messageId } = req.params;
    try {
      if (messageId) {
        let findMessage = await global.models.GLOBAL.CHAT.findOne({
          _id: messageId,
        });
        {
          if (findMessage) {
            if (findMessage.sender.toString() !== user._id.toString()) {
              const data4createResponseObject = {
                req: req,
                result: -1,
                message:
                  "Sorry, You have not access to change message of other.",
                payload: {},
                logPayload: false,
              };
              return res
                .status(enums.HTTP_CODES.NOT_ACCEPTABLE)
                .json(utils.createResponseObject(data4createResponseObject));
            }
            let updateMessage =
              await global.models.GLOBAL.CHAT.findByIdAndUpdate(
                {
                  _id: messageId,
                },
                {
                  $set: {
                    message: message,
                    isUpdated: true,
                    updatedAt: Date.now(),
                  },
                },
                {
                  new: true,
                }
              );
            let updateLastMessage =
              await global.models.GLOBAL.CHAT_ROOM.findOneAndUpdate(
                {
                  "lastMessage.messageId": ObjectId(messageId),
                },
                {
                  $set: {
                    "lastMessage.message": message,
                  },
                }
              );
            if (updateMessage) {
              const data4createResponseObject = {
                req: req,
                result: 0,
                message: "Message updated successfully.",
                payload: { updateMessage },
                logPayload: false,
              };
              return res
                .status(enums.HTTP_CODES.OK)
                .json(utils.createResponseObject(data4createResponseObject));
            }
          }
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
