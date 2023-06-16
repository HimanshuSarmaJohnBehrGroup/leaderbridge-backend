const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");
const { ObjectID } = require("mongodb");
const jwtOptions = require("../../auth/jwt-options");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
// Retrieve and return all Question from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { type, userId } = req.params;

    // console.log("ImagesImages", profileImage);
    try {
      let fillForm = await global.models.GLOBAL.USER.findOne({
        _id: userId,
      }).lean();

      const findUser = await global.models.GLOBAL.FULLYVERIFYSATUS.findOne({
        userId: ObjectID(userId),
      });

      if (!fillForm || !findUser) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.USER_DOES_NOT_EXIST,
          payload: {},
          logPayload: false,
          status: enums.HTTP_CODES.OK,
        };
        return res
          .status(400)
          .json(utils.createResponseObject(data4createResponseObject));
      }

      if (type == "reject") {
        const FindAndUpdate =
          await global.models.GLOBAL.FULLYVERIFYSATUS.findOneAndUpdate(
            { userId: ObjectID(userId) },
            {
              $set: {
                reject: true,
                accept: false,
              },
            },
            { new: true }
          );

        const FindUserData = await global.models.GLOBAL.USER.findOneAndUpdate(
          { _id: userId },
          {
            $set: {
              fullyVerified: true,
              status: false,
            },
          },
          { new: true }
        );

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
          to: fillForm.email,
          subject:
            "LeaderBridge | User verification failed and the account was deactivated.",
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
                                          <span style="font-size: 16px; line-height: 22px; color: #323232; padding-bottom: 1.25rem; display: block;">Hi ${fillForm.name},</span>
    
                                          <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                          Thanks for completing our verification process. We would like to inform you that your verification process is completed now and your uploaded documents does not meet our criteria and requirement. As a result your account has been put on hold. Please reach out to us on  <a target="_blank" style="color: #757575; text-decoration: none;" href = "mailto:support@leaderbridge.com?subject = Feedback&body = Message">
                                          support@leaderbridge.com.
                                          </a> for activating your account.
                                          </p></br>

                                          <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                          Look forward to hear from you
                                          </p></br>

                                          
    
                                      </td>
                                  </tr>
                                  <tr>
                                      <td style="padding:  0px 30px 30px 30px;">
                                          <span style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">Regards</span>
                                          <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">LeaderBridge Team</p>
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

        // let fillForm = await global.models.GLOBAL.USER.findOne({
        //   _id: userId,
        // }).lean();

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.USER_VERIFIED,
          payload: {},
          logPayload: false,
          status: enums.HTTP_CODES.OK,
        };
        return res
          .status(200)
          .json(utils.createResponseObject(data4createResponseObject));
      } else if (type == "accept") {
        const FindAndUpdate =
          await global.models.GLOBAL.FULLYVERIFYSATUS.findOneAndUpdate(
            { userId: ObjectID(userId) },
            {
              $set: {
                reject: false,
                accept: true,
              },
            },
            { new: true }
          );

        const FindUserData = await global.models.GLOBAL.USER.findOneAndUpdate(
          { _id: userId },
          {
            $set: {
              fullyVerified: true,
              status: true,
            },
          },
          { new: true }
        );

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
          to: fillForm.email,
          subject: "LeaderBridge | User verification successful",
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
                                          <span style="font-size: 16px; line-height: 22px; color: #323232; padding-bottom: 1.25rem; display: block;">Hi ${fillForm.name},</span>
    
                                          <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                          Thanks for completing our verification process. We would like to inform you that your verification process is completed now and you are marked as a verified user on our platform.
                                          </p></br>

                                          <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                          Look forward to your active participation on the platform
                                          </p></br>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td style="padding:  0px 30px 30px 30px;">
                                          <span style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">Regards</span>
                                          <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">LeaderBridge Team</p>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td  style="padding:  0 30px 30px 30px;">
                                         
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

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.USER_VERIFIED,
          payload: {},
          logPayload: false,
          status: enums.HTTP_CODES.OK,
        };
        return res
          .status(200)
          .json(utils.createResponseObject(data4createResponseObject));
      }

      // let findUser = {
      //   name: "vijay",
      // };
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
