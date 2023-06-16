const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Update Answer
module.exports = exports = {
  // route validation
  validation: Joi.object({
    answer: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    const { answerId } = req.params;
    if (!answerId) {
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
    try {
      const { isStar } = req.body;
      // // console.log("isStar-->", isStar);
      if (isStar) {
        const starAnswer = await global.models.GLOBAL.ANSWER.findOneAndUpdate(
          { _id: answerId },
          {
            $set: {
              isStar: true,
            },
          },
          {
            new: true,
          }
        );
        if (starAnswer) {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: "Answer star successfully.",
            payload: { starAnswer },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: "Something Went wrong to star Answer",
            payload: {},
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.BAD_REQUEST)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else {
        const starAnswer = await global.models.GLOBAL.ANSWER.findOneAndUpdate(
          { _id: answerId },
          {
            $set: {
              isStar: false,
            },
          },
          {
            new: true,
          }
        );
        if (starAnswer) {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: "Answer star successfully.",
            payload: { starAnswer },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: "Something Went wrong to star Answer",
            payload: {},
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.BAD_REQUEST)
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
      res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
