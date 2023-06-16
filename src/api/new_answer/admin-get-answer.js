const { ObjectId } = require("mongodb");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      let { roomId } = req;

      let findAnswer = await global.models.GLOBAL.ANSWER.find({
        roomId: ObjectId(roomId),
      }).populate({
        path: "createdBy",
        model: "user",
        select: "_id name subject profileImage currentRole countryOfResidence",
      });

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_FETCHED,
        payload: {
          Answer: findAnswer,
        },
        logPayload: false,
      };
      return data4createResponseObject;
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
