const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// User Profile update
module.exports = exports = {
  validation: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
    newPassword: Joi.string().required(),
  }),
  handler: async (req, res) => {
    const { user } = req;
    const { email, password, newPassword } = req.body;
    if (!email || !password || !newPassword) {
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
      let findUser = await global.models.GLOBAL.USER.findOne({
        _id: user._id,
      });
      if (findUser.email !== email) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.INVALID_EMAIL,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.NOT_ACCEPTABLE)
          .json(utils.createResponseObject(data4createResponseObject));
      } else if (findUser.password !== password) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.INVALID_PASSWORD,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.NOT_ACCEPTABLE)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        await global.models.GLOBAL.USER.findByIdAndUpdate(
          { _id: user._id },
          {
            $set: { password: newPassword },
          },
          { new: true }
        );

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.PASSWORD_UPDATED,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
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
      return res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
