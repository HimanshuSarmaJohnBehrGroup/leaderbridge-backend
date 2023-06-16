const { ObjectId } = require("mongodb");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      console.log("AAAASSDDDDDDDFFFFFFF", req.roomId);
      // let { user } = req;

      let findRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
        _id: req.roomId,
      }).populate({
        path: "questionId",
        model: "question",
        select:
          "_id displayProfile allowConnectionRequest status reportAbuse share experience question",
      });

      console.log("findRoomfindRoomfindRoom", findRoom);

      if (findRoom) {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_FETCHED,
          payload: {
            findRoom: findRoom,
          },
          logPayload: false,
        };
        return data4createResponseObject;
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.ITEM_NOT_FOUND,
          payload: {},
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
