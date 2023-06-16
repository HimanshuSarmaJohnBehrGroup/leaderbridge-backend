const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const jwt = require("jsonwebtoken");
const jwtOptions = require("../../auth/jwt-options");

// User Login
module.exports = exports = {
  // route validation
  validation: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
    deviceToken: Joi.string().allow(),
    userType: Joi.string(),
  }),

  handler: async (req, res) => {
    const { email, password, deviceToken, userType } = req.body;
    console.log("AAAAAAAAAAAASSSSSSSS", userType);
    if (!email || !password) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
        status: enums.HTTP_CODES.BAD_REQUEST,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    try {
      let findUser = await global.models.GLOBAL.USER.findOne({
        email: email.toLowerCase(),
        // userType: userType ? userType : "user",
      });

      console.log('USERRRRRRR', findUser);

      if (!findUser) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.USER_DOES_NOT_EXIST,
          payload: {},
          logPayload: false,
          status: enums.HTTP_CODES.OK,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        if (findUser.status === false) {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message:
              "Your account is not active. Please contact admin on support@leaderbridge.com for activation and next steps",
            payload: {},
            logPayload: false,
            status: enums.HTTP_CODES.NOT_ACCEPTABLE,
          };
          return res
            .status(enums.HTTP_CODES.NOT_ACCEPTABLE)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          if (findUser.password !== password) {
            const data4createResponseObject = {
              req: req,
              result: -1,
              message: messages.USER_NOT_FOUND,
              payload: {},
              logPayload: false,
              status: enums.HTTP_CODES.OK,
            };
            return res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          } else {
            // User found - Check is verified or not
            if (findUser.verified === false) {
              const data4createResponseObject = {
                req: req,
                result: -1,
                message: messages.USER_NOT_VERIFIED,
                payload: {},
                logPayload: false,
                status: enums.HTTP_CODES.METHOD_NOT_ALLOWED,
              };
              return res
                .status(enums.HTTP_CODES.METHOD_NOT_ALLOWED)
                .json(utils.createResponseObject(data4createResponseObject));
            } else {
              if (findUser.formFilled === false) {
                const data4createResponseObject = {
                  req: req,
                  result: -1,
                  message: messages.EMPTY,
                  payload: {},
                  logPayload: false,
                  status: enums.HTTP_CODES.METHOD_NOT_ALLOWED,
                };
                return res
                  .status(enums.HTTP_CODES.METHOD_NOT_ALLOWED)
                  .json(utils.createResponseObject(data4createResponseObject));
              } else {
                // // console.log("ABUSE--->>>", findUser.abuseAnswer);
                console.log("AAAAAAAAAAAAAAA", findUser.userType);
                const data4token = {
                  id: findUser._id,
                  date: Date.now(),
                  environment: process.env.APP_ENVIRONMENT,
                  email: email.toLowerCase(),
                  userType: findUser.userType,
                  subject: findUser.subject,
                  abuseQuestion: findUser.abuseQuestion,
                  abuseAnswer: findUser.abuseAnswer,
                  OrgRanDomID: findUser?.OrgRanDomID,
                  scope: "login",
                  currentRole: findUser?.currentRole,
                };
                if (deviceToken) {
                  await global.models.GLOBAL.USER.findByIdAndUpdate(
                    { _id: findUser._id },
                    {
                      $set: { lastLogin: Date.now(), deviceToken: deviceToken },
                    },
                    { new: true }
                  );
                } else {
                  await global.models.GLOBAL.USER.findByIdAndUpdate(
                    { _id: findUser._id },
                    {
                      $set: { lastLogin: Date.now() },
                    },
                    { new: true }
                  );
                }

                const data4createResponseObject = {
                  req: req,
                  result: 0,
                  message: messages.USER_LOGIN_SUCCESSFULLY,
                  payload: {
                    user: findUser,
                    // Responsive: Responsive,
                    token: jwt.sign(data4token, jwtOptions.secretOrKey),
                  },
                  logPayload: false,
                  status: enums.HTTP_CODES.OK,
                };
                return res
                  .status(enums.HTTP_CODES.OK)
                  .json(utils.createResponseObject(data4createResponseObject));
              }
            }
          }
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
        status: enums.HTTP_CODES.INTERNAL_SERVER_ERROR,
      };
      return res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
