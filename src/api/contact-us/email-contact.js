const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const jwt = require("jsonwebtoken");
const logger = require("../../logger");
const utils = require("../../utils");
const jwtOptions = require("../../auth/jwt-options");
const nodemailer = require("nodemailer");

// User Registration
module.exports = exports = {
  // route validation
  // validation: Joi.object({
  //   name: Joi.string().allow(),
  //   email: Joi.string().allow(),
  //   subject: Joi.string().allow(),
  //   message: Joi.string().allow(),
  // }),

  handler: async (req, res) => {
    const { id, email, subject, message, name } = req.body;
    if (!email || !subject || !message || !name) {
      const Datanodemailererror = {
        req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };

      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(Datanodemailererror));
    }
    try {
      let findEmailuser = await global.models.GLOBAL.CONTACT.find({
        email: email.toLowerCase(),
      });

      if (findEmailuser.length > 0) {
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
          subject: subject,
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
                                  <span style="font-size: 16px; line-height: 22px; color: #323232; padding-bottom: 1.25rem; display: block;">Hi ${name},</span>

                                  <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Thanks for reaching out with your following query :</p><br/>
                                  <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;"><ul><li>${findEmailuser[0]?.message}</li></ul></p>


                                  <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Here is our response for the same :</p><br/>
                                  <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;"><ul><li>${message}</li></ul></p>
                             
                             
                                 
                                  <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                  Hope this will help you to resolve this issue. Incase you are 
                                  still facing issues or your query is not addressed, feel free 
                                  to reach out to us on <a href="www.support@leaderbridge.com" style="color:#0052cc">support@leaderbridge.com</a> email
                                  </p></br>
                                  

                              </td>
                          </tr>
                          <tr>
                              <td style="padding:  60px 30px 30px 30px;">
                                  <span style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">Regards,</span>
                                  <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">The LeaderBridge Team</p>
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
        // console.log("Message sent: %s", info.messageId);
        const Replayfiledtrue =
          await global.models.GLOBAL.CONTACT.findByIdAndUpdate(id, {
            reply: true,
            adminmessage: message,
            adminsubject: subject,
          });
        // // console.log("Replayfiledtrue", Replayfiledtrue);
        if (Replayfiledtrue) {
          await Replayfiledtrue.save();

          const emailsendsuccessfully = {
            id: id,
            email: email.toLowerCase(),
            subject: subject,
            message: message,
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.MAIL_SENT,
            payload: { emailsendsuccessfully },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.GENERAL,
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
          message: messages.NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.NOT_FOUND)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    } catch (error) {}
  },
};
