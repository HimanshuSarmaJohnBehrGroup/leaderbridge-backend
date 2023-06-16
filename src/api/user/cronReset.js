const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");
const { ObjectId } = require("mongodb");
const nodemailer = require("nodemailer");

// Get User by ID
module.exports = exports = {
  ResetHandler: async (req, res) => {
    let findUser = await global.models.GLOBAL.USER.find({
      isOrganization: true,
    }).sort({
      createdAt: -1,
    });

    function isMoreThanThreeMonthsLater(createAt) {
      var currentDate = new Date();

      // Create the given date object
      var givenDate = new Date(createAt);

      // Calculate the difference in months
      var monthDiff =
        (givenDate.getFullYear() - currentDate.getFullYear()) * 12 +
        givenDate.getMonth() -
        currentDate.getMonth();
      return monthDiff >= 3;
    }

    // let FFFFFFFFFFFFFFFF = await global.models.GLOBAL.USER.find({
    //   $and: [
    //     {
    //       timestamp: {
    //         $gte: new Date(ISODate().getTime() - 1000 * 60 * 60),
    //       },
    //     },
    //     {
    //       timestamp: {
    //         $lte: ISODate(),
    //       },
    //     },
    //   ],
    // });

    // console.log("FFFFFFFFFFFFFFFF", FFFFFFFFFFFFFFFF);

    if (findUser.length > 0) {
      const DataSet = findUser.map(async (item) => {
        let isValid = false;

        const FindExpericePlan = await global.models.GLOBAL.MYPLAN.findOne({
          uid: item?._id,
        });

        const date = new Date(findUser?.createdAt);
        const month = date.getMonth() > 3;
        if (
          FindExpericePlan &&
          checkExpiration(FindExpericePlan?.validity) &&
          isMoreThanThreeMonthsLater(findUser?.createdAt)
        ) {
          await global.models.GLOBAL.USER.findOneAndUpdate(
            { _id: item?._id },
            {
              $set: {
                paymentVerified: false,
              },
            },

            { new: true }
          );
        } else if (
          !checkExpiration(FindExpericePlan?.validity) &&
          isMoreThanThreeMonthsLater(findUser?.createdAt)
        ) {
          await global.models.GLOBAL.USER.findOneAndUpdate(
            { _id: item?._id },
            {
              $set: {
                paymentVerified: false,
              },
            },

            { new: true }
          );
        }

        if (checkDateDifference(item?.createdAt))
          if (checkDateDifference(item?.createdAt) == true) {
            if (item.pwReset == true) {
              //   let transporter = nodemailer.createTransport({
              //     host: process.env.HOST,
              //     port: 587,
              //     secure: false,
              //     auth: {
              //       user: process.env.EMAIL_USER,
              //       pass: process.env.PASSWORD,
              //     },
              //   });
              //   let info = await transporter.sendMail({
              //     from: process.env.EMAIL,
              //     to: item.email,
              //     subject: "Reminder from LeaderBridge",
              //     html: `<!DOCTYPE html>
              //             <html lang="en">
              //             <head>
              //                 <meta charset="UTF-8">
              //                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
              //                 <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet">
              //                 <title> first page </title>
              //             </head>
              //             <style>
              //                 body {
              //                     font-family: 'Ubuntu', sans-serif;
              //                     background-color: #F5F5F5;
              //                 }
              //                 * {
              //                     box-sizing: border-box;
              //                 }
              //                 p:last-child {
              //                     margin-top: 0;
              //                 }
              //                 img {
              //                     max-width: 100%;
              //                 }
              //                 h1,
              //                 h2,
              //                 h3,
              //                 h4,
              //                 h5,
              //                 h6 {
              //                     margin-top: 0;
              //                 }
              //                 .company-logo-align {
              //                     display: flex;
              //                     align-items: center;
              //                     justify-content: center;
              //                 }
              //                 .company-logo-align img {
              //                     width: 80px;
              //                     height: 80px;
              //                     cursor: pointer;
              //                 }
              //                 .user-information {
              //                     background-color: #021F4C;
              //                     width: 100%;
              //                 }
              //             </style>
              //             <body style="margin: 0; padding: 0;">
              //                 <table cellpadding="0" cellspacing="0" width="100%">
              //                     <tr>
              //                         <td style="padding: 20px 0 30px 0;">
              //                             <table align="center" cellpadding="0" cellspacing="0" width="600" style=" border-collapse: collapse; border: 1px solid #ECECEC; background-color: #fff;">
              //                             <tr>
              //                             <td align="center" style="position: relative;">
              //                                 <div
              //                                 class="company-logo-align"
              //                                 style=" padding: 2rem 2rem 1rem 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto;"
              //                                 align="center">
              //                                     <img  src="https://leader-bridge.s3.ap-south-1.amazonaws.com/app.png" style= "margin:0 auto; width: 80px;height: 80px;cursor: pointer;"/>
              //                                 </div>
              //                             </td>
              //                         </tr>
              //                             <tr>
              //                                 <td style="padding:  0 30px 30px 30px;">
              //                                     <span style="font-size: 16px; line-height: 22px; color: #323232; padding-bottom: 1.25rem; display: block;"></span>
              //                                     <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">hi ${item.fname}</p><br/>
              //                                     <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Welcome to LeaderBridge®!</p><br/>
              //                                     <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
              //                                     Just wanted to remind you that your LeaderBridge account is setup and ready for you to add your logo and the description you want displayed when visitors click on your logo.
              //                                     To add these, please go to LeaderBridge.com and login.  You’ll be taken to your account page where you can upload your logo and enter the description text.
              //                                     Sincerely,
              //                                     The LeaderBridge Team
              //                                     </p>
              //                                 </td>
              //                             </tr>
              //                             <tr>
              //                                 <td style="padding:  60px 30px 30px 30px;">
              //                                     <span style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">Regards</span>
              //                                     <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">The LeaderBridge Team</p>
              //                                 </td>
              //                             </tr>
              //                             <tr>
              //                                 <td  style="padding:  0 30px 30px 30px;">
              //                                     <p align="center" style="font-size: 14px; line-height: 22px; color: #757575; margin: 0;">If you have any questions, feel free email us at
              //                                         <a target="_blank" style="color: #757575; text-decoration: none;" href = "mailto:support@leaderbridge.com?subject = Feedback&body = Message">
              //                                         support@leaderbridge.com.
              //                                         </a>
              //                                     </p>
              //                                     <p align="center" style="font-size: 14px; line-height: 22px; color: #757575; margin: 0;"> All rights reserved LeaderBridge® .</p>
              //                                 </td>
              //                             </tr>
              //                             </table>
              //                         </td>
              //                     </tr>
              //                 </table>
              //             </body>
              //             </html>`,
              //   });
            }
            if (!item.paymentVerified) {
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
                to: item.email,
                subject: "Reminder from LeaderBridge",
                html: `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet">
                            <title> first page </title>
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
                                                <span style="font-size: 16px; line-height: 22px; color: #323232; padding-bottom: 1.25rem; display: block;"></span>
          
                                                <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">hi ${item.fname}</p><br/>
                                                <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Welcome to LeaderBridge®!</p><br/>
                                                <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                                Just wanted to remind you that your LeaderBridge account is setup and ready for you to add your logo and the description you want displayed when visitors click on your logo.
          
                                                To add these, please go to LeaderBridge.com and login.  You’ll be taken to your account page where you can upload your logo and enter the description text.
          
                                                Sincerely,
                                                The LeaderBridge Team
                                                </p>
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
            if (!item.organizationDescription) {
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
                to: item.email,
                subject: "Reminder from LeaderBridge",
                html: `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet">
                            <title> first page </title>
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
                                                <span style="font-size: 16px; line-height: 22px; color: #323232; padding-bottom: 1.25rem; display: block;"></span>
          
                                                <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">hi ${item.fname}</p><br/>
                                                <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Welcome to LeaderBridge®!</p><br/>
                                                <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                                Just wanted to remind you that your LeaderBridge account is setup and
                                                the only thing it is missing is the description of your program that you 
                                                want visitors to see when they click on your logo

                                                To input your description, please go to LeaderBridge.com and login. 
                                                You’ll be taken to your account page where you can add the text
          
                                                Sincerely,
                                                The LeaderBridge Team
                                                </p>
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
            if (!item.organizationLogo) {
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
                to: item.email,
                subject: "Reminder from LeaderBridge",
                html: `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet">
                            <title> first page </title>
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
                                                <span style="font-size: 16px; line-height: 22px; color: #323232; padding-bottom: 1.25rem; display: block;"></span>
          
                                                <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">hi ${item.fname}</p><br/>
                                                <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Welcome to LeaderBridge®!</p><br/>
                                                <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                                Just wanted to remind you that your LeaderBridge account is setup and
                                                the only thing it is missing is your logo.

                                                To upload your logo, please go to LeaderBridge.com and login. You’ll 
                                                be taken to your account page where you can upload your logo
          
                                                Sincerely,
                                                The LeaderBridge Team
                                                </p>
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
            if (
              item.organizationLogo &&
              item.paymentVerified &&
              item.organizationDescription &&
              item.pwReset == false &&
              item.emailVerified == false
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
                to: item.email,
                subject: "Your LeaderBridge Account is Up and Running",
                html: `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet">
                            <title> first page </title>
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
                                                <span style="font-size: 16px; line-height: 22px; color: #323232; padding-bottom: 1.25rem; display: block;"></span>
          <br/>
                                                <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">hi ${item.fname}</p><br/>
                                                <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Welcome to LeaderBridge®!</p><br/>
                                                <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                                Your Leader Bridge account is active, your clients can now join.
                                                May we ask a favor?  When you notify your clients, would you mind 
                                                sending a copy to ???@leaderbridge.com – we are curious about how 
                                                people describe us.

                                                Thank you,

                                                The LeaderBridge Team
                                                </p>
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

              let updateByAdmin =
                await global.models.GLOBAL.USER.findOneAndUpdate(
                  {
                    email: item.email,
                  },
                  {
                    $set: {
                      emailVerified: true,
                    },
                  },
                  { new: true }
                );
            }
          } else if (
            checkDateDifference(item?.createdAt) == "expired" &&
            item.pwReset == true &&
            !item.paymentVerified &&
            !item.organizationDescription &&
            !item.organizationLogo &&
            isAdminEmail == false
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
              to: "kevin088.rejoice@gmail.com",
              subject: "Reminder from LeaderBridge",
              html: `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet">
                            <title> first page </title>
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
                                                <span style="font-size: 16px; line-height: 22px; color: #323232; padding-bottom: 1.25rem; display: block;"></span>
          
                                                <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Welcome to LeaderBridge®!</p><br/>
                                                
                                                <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                               ${item.fname} User details are not submitted yet. Please take followup.
          
                                                Sincerely,
                                                The LeaderBridge Team
                                                </p>
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

            let updateByAdmin =
              await global.models.GLOBAL.USER.findOneAndUpdate(
                {
                  email: item.email,
                },
                {
                  $set: {
                    isAdminEmail: true,
                  },
                },
                { new: true }
              );
          }
      });
    }

    if (findUser.length) {
      let data4createResponseObject = {
        req: req,
        result: 1,
        message: messages.SUCCESS,
        payload: findUser,
        logPayload: false,
      };
      return data4createResponseObject;
    }

    // convert to unix time to format utc time after code uncomment
  },
};

const checkDateDifference = (date2) => {
  const startTime = moment(new Date());
  const end = moment.utc(date2);
  const duration = moment.duration(end.diff(startTime));
  const day = Math.floor(duration.asDays());

  if (day == 1) {
    return true;
  }

  if (day == 3) {
    return true;
  }

  if (day == 7) {
    return true;
  }

  if (day > 8) {
    return "expired";
  }
};
