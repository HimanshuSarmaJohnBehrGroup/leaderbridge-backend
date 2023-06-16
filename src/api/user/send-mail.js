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
  //   validation: Joi.object({
  //     email: Joi.string().required(),
  //   }),

  // route handler
  handler: async (req, res) => {
    let { html, users } = req.body;
    let code = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
    // // console.log("Code---------->>>", code);
    // const locale = utils.getLocale(req);
    let entry;
    // If codes already exists for this email in the database delete them
    // let findUser = await global.models.GLOBAL.USER.find({
    //   //   $or: [{ email: { $eq: email } }],
    // });

    console.log("findUser---------->>>", html);

    // const data4createResponseObject = {
    //   req: req,
    //   result: -1,
    //   message: findUser,
    //   payload: {},
    //   logPayload: false,
    // };
    // return res
    //   .status(enums.HTTP_CODES.OK)
    //   .json(utils.createResponseObject(data4createResponseObject));

    const FFF = [
      {
        email: "vishv@yopmail.com",
        _id: "624d5c7e9d7a9e468822a071",
      },

      {
        email: "vijay085.rejoice@gmail.com",
        _id: "624d364df458670d1ce41b64",
      },
    ];

    // When USE_TEST_PIN is true (config.json)
    try {
      console.log("users---------->>>", users);
      if (users.length > 0) {
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

        for (let i = 0; i < users.length; i++) {
          await global.models.GLOBAL.USER.findByIdAndUpdate(
            { _id: users[i]._id },
            { $set: { isSubmit: false } }
          );
          // html = html.replace(/\[\[name\]\]/g, users[i].email);
          // html = html.replace(/\[\[uid\]\]/g, users[i]._id);
          let info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: users[i].email,
            subject: "LeaderBridge | Opt-in Request",
            html: `<!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"> 
                <script src="https://kit.fontawesome.com/b7ecb94de9.js" crossorigin="anonymous"></script>
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
                                            <img  src="https://leader-bridge.s3.ap-south-1.amazonaws.com/app.png" style= "margin:0 auto; width: 80px;height: 80px;cursor: pointer;"/>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div class="user-information" 
                                        style="padding: 25px; background-color: #021f4c; width: 91.6%;"
                                        >
                                        <p align="center" style="color: #fff; font-size: 30px; font-weight: 500; margin: 0 0 1rem 0;">LeaderBridge®</p>
                                        <span align="center" style="display: block; font-size: 16px; color: #fff;"></span>
                                        </div>
                                      
                                    </td> 
                                    <td></td>
                                </tr>
                                <tr>
                                    <td style="padding: 3rem 2rem 2rem 2rem;">
                                      <h6 align="center" style="color: #585d6a; font-size: 30px; ">Dear LeaderBridge Member,
      </h6>
                                      <p style="color: #585d6a; font-size: 14px; margin: 2.50rem 0 rem 0;">I want to thank you for joining the LeaderBridge community and participating in our project.
      </p>
                                                                                <p style="color: #585d6a; font-size: 14px; margin: 2.50rem 0 rem 0;">Based on what we have learned during the past two years, we are re-tooling the platform and focusing it on the founders of startups and early-stage companies.
      
      </p>
      <p style="color: #585d6a; font-size: 14px; margin: 2.50rem 0 rem 0;">To make this transition we will close access to the site on Sunday, June 12, 2022, and close all accounts.  If you are a founder and would like to stay on the new LeaderBridge, please <a href="http://leaderbridge.com/active/${users[i]._id}">click here</a> to choose to keep your account and we will let you know when the new version of LeaderBridge goes live.
                                
                                      <h6 style="font-size: 13px; color: #585d6a; margin: 0;  margin-top: 0;">Thank you again for your participation,</h6>
                <h6 style="font-size: 15px; color: #585d6a; margin: 0 0; padding-top:8px">John</h6>
                                    <p style="font-size: 14px; color: #585d6a; margin:0;">John Behr</p>
                                                                                                  <p style="font-size: 14px; color: #585d6a; margin: 0;  margin-top: 0;">Founder and CEO</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 3rem 2rem 2rem 2rem;">
                                      <p align="center" style="color: #585d6a; font-size: 14px; margin: 0;">
                                        If you have any queries, feel free to contact us at support@leaderbridge.com.
                                      </p>
      
                      <div style="display: flex;column-gap:16px;margin-top:20px; justify-content: center;padding-left:107px">
                                      <p style="display: flex;align-items: center;" ><img src="https://img.icons8.com/material-rounded/24/000000/facebook-new.png"/><a  target="_blank" href="https://m.facebook.com/leaderbridge/?ref=py_c">Facebook</a></p> 
                                      <p style="display: flex;align-items: center;" ><img src="https://img.icons8.com/material/24/000000/linkedin--v1.png"/><a  target="_blank" href="https://www.linkedin.com/company/leader-bridge">Linkedin</a></p>
                                      <p style="display: flex;align-items: center;"><img src="https://img.icons8.com/material-rounded/24/000000/instagram-new.png"/><a  target="_blank" href="https://www.instagram.com/leaderbridge1/">Instagram</a></p>
                                      </div>
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

        // console.log("Message sent: %s", info.messageId);

        // If (dummyAccount) {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: "Mail was sent out to the Email Address.",
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      }
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
  },
};
