const enums = require("../../../json/enums.json");

const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { roomId } = req.params;
    try {
      if (roomId) {
        let findRoom = await global.models.GLOBAL.CHAT_ROOM.findOne({
          _id: roomId,
        });
        {
          if (findRoom) {
            let muteRoom =
              await global.models.GLOBAL.CHAT_ROOM.findByIdAndUpdate(
                {
                  _id: roomId,
                },
                {
                  $addToSet: {
                    mutedBy: user._id,
                  },
                },
                {
                  new: true,
                }
              );
            if (muteRoom) {
              const data4createResponseObject = {
                req: req,
                result: 0,
                message: "Room is muted successfully.",
                payload: { muteRoom },
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
