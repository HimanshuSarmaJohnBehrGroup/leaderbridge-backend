const _ = require("lodash");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const jwtOptions = require("../../auth/jwt-options");
const logger = require("../../logger");
const utils = require("../../utils");
const nodemailer = require("nodemailer");

module.exports = exports = {
  // route validation
  validation: Joi.object({
    code: Joi.string().required(),
    email: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    let { code, email } = req.body;

    if (email.length === 0 || code.length === 0) {
      logger.error("/verify-code - Email and code cannot be empty!");
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: "Email and code cannot be empty!",
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }
    email = email.removeSpaces();

    // Find the email and code object and then delete it.
    let verificationEntry;
    try {
      verificationEntry = await global.models.GLOBAL.CODE_VERIFICATION.findOne({
        email: email.toLowerCase(),
      });
    } catch (error) {
      logger.error(
        `/verify-code - Error encountered while verifying email: ${error.message}\n${error.stack}`
      );
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: "Error",
        payload: { error: error },
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    if (!verificationEntry) {
      // SMS verification failed
      logger.error(
        `/verify-code - SMS verification for USER (email: ${email}) failed!`
      );
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.FAILED_VERIFICATION,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    // Check number of attempts and expiryTime
    const now = moment();
    const expirationDate = moment(verificationEntry.expirationDate); // another date
    if (now.isAfter(expirationDate)) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.EXPIRED_VERIFICATION,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    if (verificationEntry.code !== code) {
      verificationEntry.failedAttempts++;
      await verificationEntry.save();
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.FAILED_OTP,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    /* SMS verification done */
    logger.info(
      `/verify-code - SMS verification for USER (email: ${email}) successful!`
    );

    // Find the email no in user data if it exists or not.
    let user = await global.models.GLOBAL.USER.findOne({
      email: email.toLowerCase(),
    });
    if (user !== null) {
      let verified = await global.models.GLOBAL.USER.findOneAndUpdate(
        { email: email.toLowerCase() },
        { $set: { verified: true } },
        { new: true }
      );
      // User found - create JWT and return it
      const data4token = {
        id: user._id,
        date: Date.now(),
        environment: process.env.APP_ENVIRONMENT,
        email: email.toLowerCase(),
        scope: "login",
        type: enums.USER_TYPE.USER,
      };
      const payload = {
        user: user,
        userExist: true,
        verified: true,
        token: jwt.sign(data4token, jwtOptions.secretOrKey),
        token_type: "Bearer",
      };

      // mail funtion

      if (
        user.isCompanyVerify == true &&
        user.isCompanyId &&
        email &&
        user?.isCompany != "individualCompany"
      ) {
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
          subject: "LeaderBridge | Your account is set up now",
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

  
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Welcome to LeaderBridge®!</p><br/>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Your account is set up and ready to go.</p><br/>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Your company ID is:<b> ${user.isCompanyId}</b></p>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Your team will need this ID when they create their accounts LeaderBridge will only allow matching between users who are not on the same team or in the same organization </b></p></br>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">1.
                                      Sign up on the platform using this link : <a href="https://www.leaderbridge.com/signup" style="color:#1a73e8">https://www.leaderbridge.com/signup</a>
                                      </p></br>
                                      
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">2.
                                      During the sign up process, use the company ID shared by selecting the button : “I have company ID” and add the company ID.
                                      </p></br>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">3.
                                      Fill in all other details in the sign up form
                                      </p></br>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">4.
                                      Click on “sign up” button.
                                      </p></br>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">5.
                                      Once you click on the  “sign up” button, your account will be created.
                                      </p></br>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">6.
                                      Then you can complete the  sign up  access the platform.
                                      </p></br>
                                      
  
                                  </td>
                              </tr>
                              <tr>
                                  <td style="padding:  60px 30px 30px 30px;">
                                      <span style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">Sincerely,</span>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">The LeaderBridge Team</p>
                                  </td>
                              </tr>
                              <tr>
                                  <td  style="padding:  0 30px 30px 30px;">
                                      <p align="center" style="font-size: 14px; line-height: 22px; color: #757575; margin: 0;">If you have any questions, feel free email us at
                                          <a target="_blank" style="color: #757575; text-decoration: none;" href = "mailto:support@leaderbridge.com?subject = Feedback&body = Message">
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
      } else if (
        user.isCompanyId &&
        email &&
        user?.isCompany == "individualCompany"
      ) {
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
          subject: "LeaderBridge | Your account is set up now",
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

  
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Welcome to LeaderBridge®!</p><br/>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Your account is set up and ready to go.</p><br/>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Your company ID is:<b> ${user.isCompanyId}</b></p>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Your team will need this ID when they create their accounts LeaderBridge will only allow matching between users who are not on the same team or in the same organization </b></p></br>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">1.
                                      Sign up on the platform using this link : <a href="https://www.leaderbridge.com/signup" style="color:#1a73e8">https://www.leaderbridge.com/signup</a>
                                      </p></br>
                                      
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">2.
                                      During the sign up process, use the company ID shared by selecting the button : “I have company ID” and add the company ID.
                                      </p></br>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">3.
                                      Fill in all other details in the sign up form
                                      </p></br>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">4.
                                      Click on “sign up” button.
                                      </p></br>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">5.
                                      Once you click on the  “sign up” button, your account will be created.
                                      </p></br>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">6.
                                      Then you can complete the  sign up  access the platform.
                                      </p></br>
                                      
  
                                  </td>
                              </tr>
                              <tr>
                                  <td style="padding:  60px 30px 30px 30px;">
                                      <span style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">Sincerely,</span>
                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">The LeaderBridge Team</p>
                                  </td>
                              </tr>
                              <tr>
                                  <td  style="padding:  0 30px 30px 30px;">
                                      <p align="center" style="font-size: 14px; line-height: 22px; color: #757575; margin: 0;">If you have any questions, feel free email us at
                                          <a target="_blank" style="color: #757575; text-decoration: none;" href = "mailto:support@leaderbridge.com?subject = Feedback&body = Message">
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
        message: messages.VERIFICATION_SUCCESS,
        payload: payload,
        logPayload: false,
      };
      // verificationEntry.delete();
      // !delete verification entry [Prodcution]
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
      return;
    } else {
      // Generate token and enter into the registration collection
      const payload = {
        email: email.toLowerCase(),
        date: Date.now(),
        scope: "verification",
      };
      const token = jwt.sign(payload, jwtOptions.secretOrKey);
      const entry = global.models.GLOBAL.CODE_REGISTRATION({
        email: email.toLowerCase(),
        code: token,
        date: Date.now(),
      });
      logger.info("/verify-code - Saving registration-code in database");
      try {
        await entry.save();
      } catch (error) {
        logger.error(
          `/verify-code - Error encountered while saving registration-code: ${error.message}\n${error.stack}`
        );
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.FAILED_VERIFICATION,
          payload: { error: error },
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
          .json(utils.createResponseObject(data4createResponseObject));
      }
      if (verified.length > 0) {
        let verified = await global.models.GLOBAL.USER.findOneAndUpdate(
          { email: email },
          { $set: [{ verified: true }] },
          { new: true }
        );
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.VERIFICATION_SUCCESS,
          payload: {
            userExist: false,
            verified: true,
            token: token,
          },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    }
  },
};
