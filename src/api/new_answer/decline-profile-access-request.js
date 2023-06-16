const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    let user = await utils.getHeaderFromToken(req.user);

    const { requestId, questionId, type, owner } = req;
    if (!requestId) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
      // .status(enums.HTTP_CODES.BAD_REQUEST)
      // .json(utils.createResponseObject(data4createResponseObject));
    }

    try {
      const findRequest =
        await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findOne({
          _id: requestId,
        });
      if (findRequest) {
        let updateRequest =
          await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findByIdAndUpdate(
            {
              _id: requestId,
            },
            {
              $set: {
                status: "decline",
                owner: owner,
              },
            },
            {
              new: true,
            }
          );

        if (!type) {
          if (updateRequest) {
            const updateQuestion =
              await global.models.GLOBAL.QUESTION.findByIdAndUpdate(
                { _id: questionId },
                {
                  $set: {
                    displayProfile: false,
                  },
                },
                { new: true }
              );
          }
        }
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_UPDATED,
          payload: { updateRequest },
          logPayload: false,
        };
        return data4createResponseObject;
        // .status(enums.HTTP_CODES.OK)
        // .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        return data4createResponseObject;
        // .status(enums.HTTP_CODES.NOT_FOUND)
        // .json(utils.createResponseObject(data4createResponseObject));
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
      // .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
      // .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
