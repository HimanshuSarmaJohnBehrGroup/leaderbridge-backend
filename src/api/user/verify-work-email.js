const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Get User by ID
module.exports = exports = {
  // route validation
  validation: Joi.object({
    name: Joi.string().allow(""),
    status: Joi.string(),
  }),

  handler: async (req, res) => {
    let { id } = req.params;

    try {
      let updateUser = await global.models.GLOBAL.USER.findByIdAndUpdate(
        { _id: id },
        {
          $set: { organizationEmailVerified: true },
        },
        { new: true }
      );

      if (!updateUser) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message:
            "Sorry, Something went wrong to verify work email. Please try again later.",
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.BAD_REQUEST)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.VERIFICATION_SUCCESS,
          payload: { updateUser },
          logPayload: false,
        };
        res
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
      res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
