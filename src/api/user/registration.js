const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const jwt = require("jsonwebtoken");
const logger = require("../../logger");
const utils = require("../../utils");
const jwtOptions = require("../../auth/jwt-options");
const { ObjectId } = require("mongodb");
const nodemailer = require("nodemailer");
// User Registration
module.exports = exports = {
  // route validation
  validation: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    deviceToken: Joi.string().allow(),
    organizationId: Joi.string().optional().allow(""),
    isCompany: Joi.string().optional().allow(""),
    checkbox: Joi.allow(),
    admin: Joi.allow(),
    passwordShow: Joi.allow(),
  }),

  handler: async (req, res) => {
    const {
      email,
      name,
      password,
      organizationId,
      deviceToken,
      checkbox,
      isCompany,
      admin,
      passwordShow,
    } = req.body;

    const { user } = req;
    // const user = await global.models.GLOBAL.USER.find({
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", admin, user);
    //   OrgRanDomID: organizationId,
    // });

    var CompanyID = Math.floor(1000 + Math.random() * 9000);

    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

    // if (organizationId) {
    //   if (checkForHexRegExp.test(organizationId) === false) {
    //     const data4createResponseObject = {
    //       req: req,
    //       result: -1,
    //       message: "Please select a valid organization code",
    //       payload: {},
    //       logPayload: false,
    //     };
    //     return res
    //       .status(enums.HTTP_CODES.NOT_FOUND)
    //       .json(utils.createResponseObject(data4createResponseObject));
    //   }
    // }

    let findUser;

    if (organizationId && isCompany == "false") {
      findUser = await global.models.GLOBAL.USER.find({
        OrgRanDomID: organizationId,
      });
    } else if (organizationId && isCompany == "true") {
      findUser = await global.models.GLOBAL.USER.find({
        isCompanyId: organizationId,
        isCompanyVerify: true,
      });
    }

    if (organizationId && isCompany == "true") {
      let findCompany = await global.models.GLOBAL.USER.find({
        isCompanyId: organizationId,
      });
      console.log("CCCCCCCCCCCCCCCCCCCCCCCCC", findCompany);

      if (findCompany?.length > 4) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: "Only Allow Six members",
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.NOT_FOUND)
          .json(utils.createResponseObject(data4createResponseObject));
      }

      if (findCompany.length > 4 && findCompany.status && !findUser.isCompany) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: "Please select a valid company code",
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.NOT_FOUND)
          .json(utils.createResponseObject(data4createResponseObject));
      } else if (
        findCompany.status &&
        findUser.isCompany &&
        (!findUser.userpurchasing || findUser.userpurchasing == "just me")
      ) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: "Only Allow Six members",
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.NOT_FOUND)
          .json(utils.createResponseObject(data4createResponseObject));
      } else if (
        findCompany.status &&
        findCompany.length > 4 &&
        findUser.isCompany &&
        findUser.userpurchasing &&
        findUser.userpurchasing != "just me"
      ) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: "Only Allow Six members",
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.NOT_FOUND)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    }

    if (organizationId && isCompany == "false") {
      if (!findUser?.length) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: "Please enter a valid organization code",
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.NOT_FOUND)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    }

    if (organizationId && isCompany == "true") {
      // if (findUser[0]?.userpurchasing == "Just me") {
      //   const data4createResponseObject = {
      //     req: req,
      //     result: -1,
      //     message: "Please enter a valid company code",
      //     payload: {},
      //     logPayload: false,
      //   };
      //   return res
      //     .status(enums.HTTP_CODES.NOT_FOUND)
      //     .json(utils.createResponseObject(data4createResponseObject));
      // }

      if (!findUser?.length) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: "Please enter a valid company code",
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.NOT_FOUND)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    }

    if (!email || !name || !password) {
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
      let findUser = await global.models.GLOBAL.USER.find({
        $and: [
          {
            $or: [{ email: { $eq: email } }],
          },
        ],
      });
      if (findUser.length > 0) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.USER_ALREADY_EXISTS,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4token = {
          date: Date.now(),
          environment: process.env.APP_ENVIRONMENT,
          name: name,
          email: email.toLowerCase(),
          organizationId: organizationId && !isCompany ? organizationId : null,
          isCompanyId:
            organizationId && isCompany == "false"
              ? CompanyID
              : organizationId && isCompany == "true"
              ? organizationId
              : isCompany == "individualCompany"
              ? CompanyID
              : null,
          OrgRanDomID:
            organizationId && isCompany == "false" ? organizationId : null,
          isCompanyVerify:
            (organizationId && isCompany == "false") ||
            isCompany == "individualCompany"
              ? true
              : null,
          date: Date.now(),
          scope: "signup",
        };
        let userRegistration = {
          email: email.toLowerCase(),
          name: name,
          password: password,
          organizationId:
            organizationId && isCompany == "false" ? organizationId : null,
          isCompanyId:
            (organizationId && isCompany == "false") ||
            isCompany == "individualCompany"
              ? CompanyID
              : organizationId && isCompany == "true"
              ? organizationId
              : null,
          isCompanyVerify:
            (organizationId && isCompany == "false") ||
            isCompany == "individualCompany"
              ? true
              : null,
          deviceToken: deviceToken,
          OrgRanDomID:
            organizationId && isCompany == "false" ? organizationId : null,
          checkbox: checkbox,
          isCompany:
            isCompany == "individualCompany" ? "individualCompany" : null,
          token: jwt.sign(data4token, jwtOptions.secretOrKey),
          createdAt: Date.now(),
        };

        const newUser = await global.models.GLOBAL.USER(userRegistration);
        const contregister = await global.models.GLOBAL.USER.count(
          userRegistration
        );
        try {
          await newUser.save();
        } catch (error) {
          logger.error(
            "/user - Error encountered while trying to add new user:\n" + error
          );
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.FAILED_REGISTRATION,
            payload: {},
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
            .json(utils.createResponseObject(data4createResponseObject));
        }

        const responseObj = {
          createdBy: newUser.createdBy,
          updatedBy: newUser.updatedBy,
          token: newUser.token,
          _id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
          lastLogin: newUser.lastLogin,
          userType: newUser.userType,
          deviceToken: newUser.deviceToken,
        };

        if (admin == "admin") {
          let transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: 587,
            secure: false,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.PASSWORD,
            },
          });
          let info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: newUser.email,
            subject: "Welcome to LeaderBridge®",
            html: `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet">
          </head>
          <style>
              body {
                  font-family: 'Ubuntu', sans-serif;
                  background-color: #F5F5F5;
              }
              * {
                  box-sizing: border-box;
              }
              p:last-child {
                  margin-top: 0;
              }
              img {
                  max-width: 100%;
              }
              h1,
              h2,
              h3,
              h4,
              h5,
              h6 {
                  margin-top: 0;
              }
              .company-logo-align {
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }
              .company-logo-align img {
                  width: 80px;
                  height: 80px;
                  cursor: pointer;
              }
              .user-information {
                  background-color: #021F4C;
                  width: 100%;
              }
          </style>
          <body style="margin: 0; padding: 0;">
              <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                      <td style="padding: 20px 0 30px 0;">
                          <table align="center" cellpadding="0" cellspacing="0" width="600" style=" border-collapse: collapse; border: 1px solid #ECECEC; background-color: #fff;">
                          <tr>
                          <td align="center" style="position: relative;">
                              <div
                              class="company-logo-align"
                              style=" padding: 2rem 2rem 1rem 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto;"
                              align="center">
                                  <img  src="https://leader-bridge.s3.ap-south-1.amazonaws.com/app.png" style= "margin:0 auto; width: 80px;height: 80px;cursor: pointer;"/>
                              </div>
                          </td>
                      </tr>
                          <tr>
                              <td style="padding:  0 30px 30px 30px;">
                                  <span style="font-size: 16px; line-height: 22px; color: #323232; padding-bottom: 1.25rem; display: block;">Hi ${newUser.name},</span>

                                  <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;"Welcome to LeaderBridge!!</p><br/>
                                  <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">We are happy to have you on this journey and wish that your experience is smooth and worth of your time.</p><br/>
                                  <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Your account is created by the admin and below are the credentials</p></br>
                                  <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">1.Login Link:<b><a href="https://www.leaderbridge.com/signin" style="color:#0052CC">https://www.leaderbridge.com/signin</a></b></p>
                                  <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">1.User Name:<b> ${newUser.name}</b></p>
                                  <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">2.Password:<b> ${passwordShow}</b></p><br/>
                                  <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                  Incase of any queries feel free to write us an email on :><a  style="color:#0052CC">support@leadebridge.com</a>
                                  </p></br>

                              </td>
                          </tr>

                          <tr>
                              <td  style="padding:  0 30px 30px 30px;">
                                  <p align="left" style="font-size: 14px; line-height: 22px; color: #757575; margin: 0;">Regards,

                                  </p>
                                  <p align="left" style="font-size: 14px; line-height: 22px; color: #757575; margin: 0;">John</p>
                              </td>
                          </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>
          </html>`,
          });
        }

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.USER_REGISTRATION_SUCCESS,
          payload: responseObj,

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
