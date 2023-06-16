const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      let { user } = req;
      let { roomId } = req.params;
      let { answerId, answer, messageStar } = req.body;
      let findAnswerRoom = await global.models.GLOBAL.ANSWER_ROOM.find({
        _id: roomId,
      });
      if (findAnswerRoom) {
        let answerObj;
        findAnswerRoom.map((ansObj) => {
          answerObj = ansObj.answer.map((ansId) => {
            if (ansId._id == answerId) {
              return {
                // answerAt: Date.now(),
                updatedAt: Date.now(),
                isUpdated: true,
                _id: ansId._id,
                answer: answer ? answer : ansId?.answer,
                // messageStar:
                messageStar:
                  messageStar != undefined ? messageStar : ansId?.messageStar,
                answerBy: ansId.answerBy,
              };
            } else {
              return {
                // answerAt: ansId.answerAt,
                updatedAt: ansId.updatedAt,
                isUpdated: ansId.isUpdated,
                _id: ansId._id,
                answer: ansId.answer,
                messageStar: ansId.messageStar,
                answerBy: ansId.answerBy,
              };
            }
          });
        });
        let starAndUpdate =
          await global.models.GLOBAL.ANSWER_ROOM.findOneAndUpdate(
            { _id: roomId },
            {
              $set: {
                answer: answerObj,
              },
            },
            { new: true }
          );
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_UPDATED,
          payload: { starAndUpdate },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.ITEM_NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.NOT_FOUND)
          .json(utils.createResponseObject(data4createResponseObject));
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
      res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
