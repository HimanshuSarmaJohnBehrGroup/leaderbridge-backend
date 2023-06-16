const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");

const utils = require("../../utils");
const nodemailer = require("nodemailer");

// Add About Us by admin
module.exports = exports = {
  // route validation
  validation: Joi.object({
    userId: Joi.string().required(),
    pid: Joi.string().required(),
    paymentId: Joi.string().required(),
    planduration: Joi.string().required(),
    userpurchasing: Joi.string().required(),
    planCost: Joi.number().required(),
    validity: Joi.number().required(),
  }),
  handler: async (req, res) => {
    const {
      pid,
      paymentId,
      planCost,
      validity,
      userId,
      planduration,
      userpurchasing,
    } = req.body;

    if (!planCost || !pid || !paymentId || !validity || !userId) {
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

    //find other plan is already added
    const plan = await global.models.GLOBAL.MYPLAN.findOne({
      uid: userId,
    }).sort({ createdAt: -1 });

    let validityDate = new Date();
    let startDate = new Date();
    if (plan) {
      validityDate = new Date(plan.validity);
      startDate = new Date(plan.validity);
    }
    validityDate.setDate(validityDate.getDate() + validity);

    try {
      // let addNewPlan;
      if (plan) {
        let addNewPlan = await global.models.GLOBAL.MYPLAN.findByIdAndUpdate(
          plan._id,
          {
            $set: {
              startDate: startDate,
              validity: validityDate,
              uid: userId,
              pid: pid,
              paymentId: paymentId,
              planCost: planCost,
              userpurchasing: userpurchasing,
              planduration: planduration,
            },
          }
        );

        await global.models.GLOBAL.USER.findByIdAndUpdate(userId, {
          $set: {
            paymentVerified: true,
            userpurchasing: userpurchasing,
          },
        });

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_INSERTED,
          payload: { addNewPlan },
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        let newPlan = {
          uid: userId,
          pid: pid,
          paymentId: paymentId,
          planCost: planCost,
          startDate: startDate,
          validity: validityDate,
          userpurchasing: userpurchasing,
          planduration: planduration,
        };

        await global.models.GLOBAL.USER.findByIdAndUpdate(userId, {
          $set: {
            paymentVerified: true,
            userpurchasing: userpurchasing,
          },
        });
        let addNewPlan = await global.models.GLOBAL.MYPLAN(newPlan);
        addNewPlan.save();

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_INSERTED,
          payload: { addNewPlan },
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      }

      // let user = await global.models.GLOBAL.USER.findOne({ _id: userId });
      // if (user?.isCompany == "individualCompany") {
      //   if (userpurchasing != "Just me") {
      //     let transporter = nodemailer.createTransport({
      //       host: process.env.HOST,
      //       port: 587,
      //       secure: false,
      //       auth: {
      //         user: process.env.EMAIL_USER,
      //         pass: process.env.PASSWORD,
      //       },
      //     });

      //     let info = await transporter.sendMail({
      //       from: process.env.EMAIL,
      //       to: user?.email,
      //       subject: "Welcome to LeaderBridge",
      //       html: `<!DOCTYPE html>
      //         <html lang="en">
      //         <head>
      //             <meta charset="UTF-8">
      //             <meta name="viewport" content="width=device-width, initial-scale=1.0">
      //             <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet">
      //         </head>
      //         <style>
      //             body {
      //                 font-family: 'Ubuntu', sans-serif;
      //                 background-color: #F5F5F5;
      //             }
      //             * {
      //                 box-sizing: border-box;
      //             }
      //             p:last-child {
      //                 margin-top: 0;
      //             }
      //             img {
      //                 max-width: 100%;
      //             }
      //             h1,
      //             h2,
      //             h3,
      //             h4,
      //             h5,
      //             h6 {
      //                 margin-top: 0;
      //             }
      //             .company-logo-align {
      //                 display: flex;
      //                 align-items: center;
      //                 justify-content: center;
      //             }
      //             .company-logo-align img {
      //                 width: 80px;
      //                 height: 80px;
      //                 cursor: pointer;
      //             }
      //             .user-information {
      //                 background-color: #021F4C;
      //                 width: 100%;
      //             }
      //         </style>
      //         <body style="margin: 0; padding: 0;">
      //             <table cellpadding="0" cellspacing="0" width="100%">
      //                 <tr>
      //                     <td style="padding: 20px 0 30px 0;">
      //                         <table align="center" cellpadding="0" cellspacing="0" width="600" style=" border-collapse: collapse; border: 1px solid #ECECEC; background-color: #fff;">
      //                         <tr>
      //                         <td align="center" style="position: relative;">
      //                             <div
      //                             class="company-logo-align"
      //                             style=" padding: 2rem 2rem 1rem 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto;"
      //                             align="center">
      //                                 <img  src="https://leader-bridge.s3.ap-south-1.amazonaws.com/app.png" style= "margin:0 auto; width: 80px;height: 80px;cursor: pointer;"/>
      //                             </div>
      //                         </td>
      //                     </tr>
      //                         <tr>
      //                             <td style="padding:  0 30px 30px 30px;">

      //                                 <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Welcome to LeaderBridge®!</p><br/>
      //                                 <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Your account is set up and ready to go.</p><br/>
      //                                 <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Please use this temporary password to login <b>in the next 48 hours,</b> otherwise your</p>
      //                                <p>USER</p>
      //                                 <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Please use this id for company:<b> ${user.isCompanyId}</b></p>
      //                                 <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
      //                                 Your staff and portfolio companies will need this Organization Number when they create
      //                                 their accounts.  We will send you a separate message with information to distribute to
      //                                 your staff and portfolio companies about signing up and using the LeaderBridge
      //                                 platform.
      //                                 </p></br>
      //                                 <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
      //                                 Once you login, you will be asked to create a new password and to upload your logo to
      //                                 display on your co-branded web and app screens.
      //                                 </p></br>
      //                                 <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
      //                                 If you have any questions, please contact us at support@leaderbridge.com
      //                                 </p></br>

      //                             </td>
      //                         </tr>
      //                         <tr>
      //                             <td style="padding:  60px 30px 30px 30px;">
      //                                 <span style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">Sincerely,</span>
      //                                 <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">The LeaderBridge Team</p>
      //                             </td>
      //                         </tr>
      //                         <tr>
      //                             <td  style="padding:  0 30px 30px 30px;">
      //                                 <p align="center" style="font-size: 14px; line-height: 22px; color: #757575; margin: 0;">If you have any questions, feel free email us at
      //                                     <a target="_blank" style="color: #757575; text-decoration: none;" href = "mailto:support@leaderbridge.com?subject = Feedback&body = Message">
      //                                     support@leaderbridge.com.
      //                                     </a>
      //                                 </p>
      //                                 <p align="center" style="font-size: 14px; line-height: 22px; color: #757575; margin: 0;"> All rights reserved LeaderBridge® .</p>
      //                             </td>
      //                         </tr>
      //                         </table>
      //                     </td>
      //                 </tr>
      //             </table>
      //         </body>
      //         </html>`,
      //     });
      //   } else {
      //     await global.models.GLOBAL.USER.findByIdAndUpdate(userId, {
      //       $set: {
      //         isCompanyVerify: null,
      //         isCompanyId: null,
      //         OrgRanDomID: null,
      //       },
      //     });
      //   }
      // }
      // console.log("FFFFFFFFFFFFFFFFFFFF", user);
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
