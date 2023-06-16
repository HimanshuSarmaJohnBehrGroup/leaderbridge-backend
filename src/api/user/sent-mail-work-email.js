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
    organizationEmail: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    const { user } = req;
    // // console.log("USER-->>", user);
    const { organizationEmail } = req.body;

    let findUser = await global.models.GLOBAL.USER.findOne({
      _id: user._id,
    });

    if (String(findUser.organizationEmail) !== String(organizationEmail)) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.FAILED_VERIFICATION,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    } else {
      try {
        // console.log("MAIL SENDING");
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
          to: organizationEmail,
          subject: "LeaderBridge | Verify Your Work Email",
          html: `<!DOCTYPE html>
                <html lang="en">
                
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"> 
                    <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet">
                </head>
                <style>
                    body {
                        font-family: 'Ubuntu', sans-serif;
                        background-color: #f5f5f5;
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
                </style>
                
                <body style="margin: 0; padding: 0;">
                    <table cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="padding: 20px 0 30px 0;">
                                <table align="center" cellpadding="0" cellspacing="0" width="600" style=" border-collapse: collapse; border: 1px solid #ececec; background-color: #fff;">
                                    <tr>
                                        <td align="center" style="position: relative;">
                                            <div
                                            class="company-logo-align"
                                            style=" padding: 2rem 2rem 1rem 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto;"
                                            align="center">
                                                <img  src="https://leader-bridge.s3.ap-south-1.amazonaws.com/app.png " style= "margin:0 auto; width: 80px;height: 80px;cursor: pointer;"/>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="user-information" 
                                            style="padding: 25px; background-color: #021f4c; width: 91.6%;"
                                            >
                                            <p align="center" style="color: #fff; font-size: 30px; font-weight: 500; margin: 0 0 0rem 0;">Welcome to LeaderBridge®</p>
                                            </div>
                                          
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 1rem 2rem 0rem 1rem;">
                                        <h4 align="left" style="color: #585d6a; font-size: 14px;  ">Hi ${findUser.name},</h4>
                                        <p align="left" style="color: #585d6a; font-size: 14px; margin: 1.50rem 16rem 0rem 0;">Thank you for signing up with LeaderBridge®</p>
                                        <h2 align="left" style="color: #585d6a; font-size: 25px; text-align:"left" ">Verify Your Email Address</h2>
                                          <p align="left" style="color: #585d6a; font-size: 14px; ">Please click on this <a  href="https://leaderbridge.com/VerifyWorkEmail/${findUser._id}" style="color:#0B57D0">link</a> to verify our email address</p>
                                          
                                         
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 15px 18px ;">
                                        <p  style="color: #585d6a; font-size: 14px; margin: 0; border-bottom:15px solid transparent">
                                        If you have any questions, feel free to contact us at support@leaderbridge.com.
                                      </p>
                                      <table width="100%">
                                   
                                    </table>

                                        </td>
                                        
                                    </tr>
                                  <i class="fa fa-bars" style="font-size: 12px; color: #585d6a; margin: 0;">
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                
                </html>`,
        });
        // console.log("Message sent: %s", info.messageId);
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
      } catch (error) {
        logger.error(
          `${req.originalUrl} - Error while sending Mail : ${error.message}\n${error.stack}`
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
    }
  },
};
