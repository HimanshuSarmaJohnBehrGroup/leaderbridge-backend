const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  validation: Joi.object({
    password: Joi.string().required(),
    message: Joi.string().required(),
    text: Joi.string().allow(""),
    status: Joi.boolean(),
  }),
  handler: async (req, res) => {
    const { user } = req;
    const userExists = await global.models.GLOBAL.USER.findById({
      _id: user._id,
    });
    if (!userExists) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.NOT_FOUND,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    try {
      let { password, message, text, status } = req.body;
      if (userExists) {
        if (userExists.password !== password) {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.INCORRECT_PASSWORD,
            payload: {},
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.BAD_REQUEST)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const deactivateUser =
            await global.models.GLOBAL.USER.findOneAndUpdate(
              { _id: user._id },
              {
                $set: {
                  status: status,
                  message: message,
                  text: text,
                },
              },
              { new: true }
            );

          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.USER_DEACTIVATE,
            payload: {},
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
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
