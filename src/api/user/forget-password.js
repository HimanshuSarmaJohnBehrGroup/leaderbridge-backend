const Joi = require("joi");
const enums = require("../../../json/enums.json");
const events = require("../../../json/events.json");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const utils = require("../../utils");
const config = require("../../../config.json");
const nodemailer = require("nodemailer");

module.exports = exports = {
  // route validation
  validation: Joi.object({
    email: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    const { email } = req.body;

    let findUser = await global.models.GLOBAL.USER.findOne({
      $or: [{ email: { $eq: email } }],
      userType: "user",
    });
    // try {
    if (findUser) {
      if (String(findUser.email) === String(email)) {
        if (!email) {
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
        } else {
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
            to: email,
            subject: "Reset Your Password",

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

                                      <span style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Hi ${
                                        findUser.name
                                          ? findUser.name
                                          : findUser.organizationName
                                      }</span><br/>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">We received your request to reset your password. Click the link below to get started.</p><br/>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">If it doesn’t work, you can copy and paste the following link in your browser:</p><br/>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;"><a  style="color: #2a50dd;" href="https://leaderbridge.com/reset-password/${
                                        findUser._id
                                      }">https://leaderbridge.com/reset-password/${
              findUser._id
            }</a></p>

                                  </td>
                              </tr>
                              <tr>
                                  <td style="padding:  60px 30px 30px 30px;">
                                      <span style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">Regards</span>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">The LeaderBridge Team</p>
                                  </td>
                              </tr>
                              <tr>
                                  <td  style="padding:  0 30px 30px 30px;">
                                      <p align="center" style="font-size: 14px; line-height: 22px; color: #757575; margin: 0;">If you have any questions, feel free email us at
                                          <a target="_blank" style="color: #2a50dd; text-decoration: none;" href = "mailto:support@leaderbridge.com?subject = Feedback&body = Message">
                                          support@leaderbridge.com.
                                          </a>
                                      </p>
                                      <p align="center" style="font-size: 14px; line-height: 22px; color: #757575; margin: 0;"> All rights reserved LeaderBridge® .</p>
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
          message: messages.MAIL_SENT,
          payload: {},
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
        message: messages.USER_DOES_NOT_EXIST_USER,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.METHOD_NOT_ALLOWED)
        .json(utils.createResponseObject(data4createResponseObject));
    }
    // } catch (error) {
    //   logger.error(
    //     `${req.originalUrl} - Error while deleting the old codes from the database: ${error.message}\n${error.stack}`
    //   );
    //   const data4createResponseObject = {
    //     req: req,
    //     result: -1,
    //     message: messages.FAILED_VERIFICATION,
    //     payload: {},
    //     logPayload: false,
    //   };
    //   return res
    //     .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
    //     .json(utils.createResponseObject(data4createResponseObject));
    // }
  },
};
