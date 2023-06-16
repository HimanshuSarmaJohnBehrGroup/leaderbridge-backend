const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  handler: async (req, res) => {
    const { user } = req;
    const { id } = req.params;
    if (!id) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    const matchingExist = await global.models.GLOBAL.MATCHING.findOne({
      $and: [{ matchingBy: user._id }, { matchingTo: id }],
    });
    if (matchingExist) {
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: "Matching reject successfully.",
        payload: { matchingExist },
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    } else {
      try {
        const matchingObj = {
          matchingBy: user._id,
          matchingTo: id,
          status: "Reject",
        };
        const newMatching = await global.models.GLOBAL.MATCHING.create(
          matchingObj
        );

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: "Matching rejected successfully.",
          payload: { newMatching },
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
    }
  },
};
