const { createCanvas, loadImage } = require("canvas");
const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const utils = require("../../utils");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const jwtOptions = require("../../auth/jwt-options");
const { ObjectId } = require("mongodb");

// User Registration
module.exports = exports = {
  // route validation
  //   validation: Joi.object({
  //     email: Joi.string().required(),
  //     organizationName: Joi.string().required(),
  //     currentRole: Joi.string().required(),
  //     region: Joi.string().required(),
  //     organizationEmail: Joi.string().required(),
  //     linkedinProfile: Joi.string().required(),
  //     organizationWebsite: Joi.string().allow(""),
  //     otherLink: Joi.string().allow(""),
  //     howDidFind: Joi.string().required(),
  //     subject: Joi.array().required(),
  //   }),

  handler: async (req, res) => {
    const { userId } = req.query;

    try {
      let findUser = await global.models.GLOBAL.USER.findOne({
        _id: ObjectId(userId),
      });

      if (findUser) {
        //load images && draw image in existing canvas

        let fillForm = await global.models.GLOBAL.USER.findOne({ _id: userId });

        if (!fillForm) {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.GENERAL,
            payload: {},
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.BAD_REQUEST)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_UPDATED,
            payload: {
              fillForm,
            },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.USER_DOES_NOT_EXIST,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.NOT_FOUND)
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
