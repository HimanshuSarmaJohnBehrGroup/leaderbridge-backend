const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Answer from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { sent } = req.query;
    const { received } = req.query;

    try {
      let findMatching;
      if (sent) {
        findMatching = await global.models.GLOBAL.MATCHING.find({
          matchingBy: user._id,
        }).populate({
          path: "matchingTo",
          model: "user",
          select: "_id name email profileImage region currentRole subject",
        });
      }

      if (received) {
        findMatching = await global.models.GLOBAL.MATCHING.find({
          matchingTo: user._id,
        }).populate({
          path: "matchingBy",
          model: "user",
          select: "_id name email profileImage region currentRole subject",
        });
      }
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_FETCHED,
        payload: { findMatching },
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
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
