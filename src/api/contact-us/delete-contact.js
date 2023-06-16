const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  // route validation
  // validation: Joi.object({
  //     name: Joi.string(),
  //     email: Joi.string(),
  //     status: Joi.string(),
  // }),

  handler: async (req, res) => {
    const { userId } = req.params;
    // // console.log("userId", userId);
    const ContactExists = await global.models.GLOBAL.CONTACT.findById(userId);
    if (!ContactExists) {
      const ContactExistsNotexits = {
        req: req,
        result: -1,
        message: "Contact does not exitsts in system",
        payload: {},
        logPayload: false,
      };

      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(ContactExistsNotexits));
    }

    try {
      if (userId) {
        const responseDelete =
          await global.models.GLOBAL.CONTACT.findByIdAndRemove(userId);
        // // console.log("responseDelete", responseDelete);
        const allowuserId = {
          req: req,
          result: 0,
          message: messages.ITEM_DELETED,
          payload: {},
          logPayload: false,
        };

        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(allowuserId));
      } else {
        const Useridnotexits = {
          req: req,
          result: -1,
          message: "Provide necessary data for updation.",
          payload: {},
          logPayload: false,
        };
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
