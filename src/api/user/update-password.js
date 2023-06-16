const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const jwtOptions = require("../../auth/jwt-options");
const jwt = require("jsonwebtoken");

const logger = require("../../logger");
const utils = require("../../utils");

// User Profile update
module.exports = exports = {
  validation: Joi.object({
    password: Joi.string().required(),
  }),
  handler: async (req, res) => {
    // const { user } = req;
    const { userId } = req.params;

    console.log("FFFFFFFFFFFF", userId);
    const { password } = req.body;
    if (!password) {
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
        _id: userId,
      });

      if (!findUser) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: "Specific user dose not exist.",
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.NOT_ACCEPTABLE)
          .json(utils.createResponseObject(data4createResponseObject));
      } else if (findUser.pwReset === true) {
        let updatePassword = await global.models.GLOBAL.USER.findByIdAndUpdate(
          { _id: userId },
          {
            $set: {
              password: password,
              pwReset: false,
            },
          },
          { new: true }
        );

        let findUser = await global.models.GLOBAL.USER.findOne({
          _id: userId,
        });

        const data4token = {
          id: findUser._id,
          date: Date.now(),
          environment: process.env.APP_ENVIRONMENT,
          email: findUser.email,
          userType: findUser.userType,
          subject: findUser.subject,
          abuseQuestion: findUser.abuseQuestion,
          abuseAnswer: findUser.abuseAnswer,
          OrgRanDomID: findUser?.OrgRanDomID,
          scope: "login",
          currentRole: findUser?.currentRole,
        };
        if (updatePassword) {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.PASSWORD_UPDATED,
            payload: {
              user: findUser,
              token: jwt.sign(data4token, jwtOptions.secretOrKey),
            },

            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message:
              "Something Went Wrong to Update Password so please try again Later",
            payload: {},
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.BAD_REQUEST)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else {
        let updatePassword = await global.models.GLOBAL.USER.findByIdAndUpdate(
          { _id: userId },
          {
            $set: {
              password: password,
            },
          },
          { new: true }
        );

        let findUser = await global.models.GLOBAL.USER.findOne({
          _id: userId,
        });

        const data4token = {
          id: findUser._id,
          date: Date.now(),
          environment: process.env.APP_ENVIRONMENT,
          email: findUser.email,
          userType: findUser.userType,
          subject: findUser.subject,
          abuseQuestion: findUser.abuseQuestion,
          abuseAnswer: findUser.abuseAnswer,
          OrgRanDomID: findUser?.OrgRanDomID,
          scope: "login",
          currentRole: findUser?.currentRole,
        };
        if (updatePassword) {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.PASSWORD_UPDATED,
            payload: {
              user: findUser,
              token: jwt.sign(data4token, jwtOptions.secretOrKey),
            },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message:
              "Something Went Wrong to Update Password so please try again Later",
            payload: {},
            logPayload: false,
          };
          return res
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
      return res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
