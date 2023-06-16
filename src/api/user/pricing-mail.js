const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");
const { ObjectId } = require("mongodb");
const nodemailer = require("nodemailer");
// Get User by ID
module.exports = exports = {
  handler: async (req, res) => {
    // let { userId, status } = req.body;
    // console.log("reqetuyetuyetuyetuy--->>", req);

    try {
      const FindUser = await global.models.GLOBAL.USER.find({});
      function convertToZero(value) {
        if (value < 0) {
          return 0;
        } else {
          return value;
        }
      }
      async function isMoreThanThreeMonthsLater(startDate, validity, user) {
        // Pricing plan start date
        var startDate = new Date(startDate);

        // Pricing plan end date
        var endDate = new Date(validity);

        // Current date
        var currentDate = new Date();

        // Calculate the difference in milliseconds between the end date and current date
        var differenceInMilliseconds = endDate - currentDate;

        // Calculate the difference in days
        var differenceInDays = Math.floor(
          differenceInMilliseconds / (1000 * 60 * 60 * 24)
        );

        // Check if there are exactly 2 days left in the pricing plan
        console.log("AAAAAAAAASSSSSDDDDDDDDD", convertToZero(differenceInDays));
        if (differenceInDays > -2) {
          if (convertToZero(differenceInDays) === 2) {
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
              to: user?.email,
              subject:
                "Ref : LeaderBridge | Your Premium Subscription expires soon ",
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
                                                          <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                                          We hope you were able to spend the last 3 months exploring how LeaderBridge can help you in problem solving and get solutions to your question/concerns.  
                                                          </p><br/>
        
                                                          <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;"> 
                                                          Your premium subscription will end in ${Math.abs(
                                                            differenceInDays
                                                          )} days. When your Premium Subscription expires, you’ll revert to our Free plan and premium features will not be available for use. Upgrade now to continue using the premium features. 
                                                          </p>
        
                                                                 <button style="background-color: rgba(230, 25, 82, 1);color: rgba(255, 255, 255, 1);border: none;padding: 10px 20px;border-radius: 5px;cursor: pointer;display: flex;justify-content: center;align-items: center;text-align: center;margin: 10px auto 22px;"><a href="https://www.leaderbridge.com/setting-page" style="text-decoration: none; color: #fff;">Upgrade Now</a></button>
                                                          
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
            // Add your logic here for the 2-day notification or actions
          } else if (convertToZero(differenceInDays) === 1) {
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
              to: user?.email,
              subject:
                "Ref : LeaderBridge | Your Premium Subscription expires soon ",
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
                                                              <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                                              We hope you were able to spend the last 3 months exploring how LeaderBridge can help you in problem solving and get solutions to your question/concerns.  
                                                              </p><br/>
            
                                                              <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;"> 
                                                              Your premium subscription will end in ${Math.abs(
                                                                differenceInDays
                                                              )} days. When your Premium Subscription expires, you’ll revert to our Free plan and premium features will not be available for use. Upgrade now to continue using the premium features. 
                                                              </p>
            
                                                                     <button style="background-color: rgba(230, 25, 82, 1);color: rgba(255, 255, 255, 1);border: none;padding: 10px 20px;border-radius: 5px;cursor: pointer;display: flex;justify-content: center;align-items: center;text-align: center;margin: 10px auto 22px;"><a href="https://www.leaderbridge.com/setting-page" style="text-decoration: none; color: #fff;">Upgrade Now</a></button>
                                                             
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
          } else if (convertToZero(differenceInDays) === 0) {
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
              to: user?.email,
              subject:
                "Ref : LeaderBridge | Your Premium Subscription has expired ",
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
                                                          <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                                          We hope you were able to spend the last 3 months exploring how LeaderBridge can help you in problem solving and get solutions to your question/concerns.   
                                                          </p><br/>
        
                                                          <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;"> 
                                                          Your premium subscription has expired. We have reverted you to our Free plan and premium features are not available for use. Upgrade now to continue using the premium features.  
                                                          </p>
        
                                                                 <button style="background-color: rgba(230, 25, 82, 1);color: rgba(255, 255, 255, 1);border: none;padding: 10px 20px;border-radius: 5px;cursor: pointer;display: flex;justify-content: center;align-items: center;text-align: center;margin: 10px auto 22px;"><a href="https://www.leaderbridge.com/setting-page" style="text-decoration: none; color: #fff;">Upgrade Now</a></button>
                                                          
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
            const UpdateUser = await global.models.GLOBAL.USER.findOneAndUpdate(
              {
                _id: ObjectId(user?._id),
              },
              {
                $set: {
                  paymentVerified: false,
                  userpurchasing: null,
                  planduration: null,
                },
              }
            );
          } else {
            console.log(
              "You are not eligible for the 2-day notification in the pricing plan."
            );
            // Add your logic here for the regular flow or other notifications
          }
        }
      }

      async function ExpriceDate(date, user) {
        var signupDate = new Date(date); // Replace with the actual signup date

        // Calculate the target date for the end of the 3-month period
        var targetDate = new Date(signupDate);
        targetDate.setMonth(targetDate.getMonth() + 3);

        // Calculate the difference in milliseconds between the current date and the target date
        var currentDate = new Date();
        var differenceInMilliseconds = targetDate - currentDate;

        // Calculate the difference in days
        var differenceInDays = Math.floor(
          differenceInMilliseconds / (1000 * 60 * 60 * 24)
        );
        console.log("FAAAAAAAAAAAAAAAAAA", convertToZero(differenceInDays));
        if (differenceInDays > -2) {
          if (convertToZero(differenceInDays) === 2) {
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
              to: user?.email,
              subject:
                "Ref : LeaderBridge | Your Premium Subscription expires soon ",
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
                                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                                      We hope you were able to spend the last 3 months exploring how LeaderBridge can help you in problem solving and get solutions to your question/concerns.  
                                                      </p><br/>
    
                                                      <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;"> 
                                                      Your premium subscription will end in ${Math.abs(
                                                        differenceInDays
                                                      )} days. When your Premium Subscription expires, you’ll revert to our Free plan and premium features will not be available for use. Upgrade now to continue using the premium features. 
                                                      </p>
    
                                                             <button style="background-color: rgba(230, 25, 82, 1);color: rgba(255, 255, 255, 1);border: none;padding: 10px 20px;border-radius: 5px;cursor: pointer;display: flex;justify-content: center;align-items: center;text-align: center;margin: 10px auto 22px;"><a href="https://www.leaderbridge.com/setting-page" style="text-decoration: none; color: #fff;">Upgrade Now</a></button>
                                                     
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
          } else if (convertToZero(differenceInDays) === 1) {
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
              to: user?.email,
              subject:
                "Ref : LeaderBridge | Your Premium Subscription expires soon ",
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
                                                          <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                                          We hope you were able to spend the last 3 months exploring how LeaderBridge can help you in problem solving and get solutions to your question/concerns.  
                                                          </p><br/>
        
                                                          <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;"> 
                                                          Your premium subscription will end in ${Math.abs(
                                                            differenceInDays
                                                          )} days. When your Premium Subscription expires, you’ll revert to our Free plan and premium features will not be available for use. Upgrade now to continue using the premium features. 
                                                          </p>
        
                                                                 <button style="background-color: rgba(230, 25, 82, 1);color: rgba(255, 255, 255, 1);border: none;padding: 10px 20px;border-radius: 5px;cursor: pointer;display: flex;justify-content: center;align-items: center;text-align: center;margin: 10px auto 22px;"><a href="https://www.leaderbridge.com/setting-page" style="text-decoration: none; color: #fff;">Upgrade Now</a></button>
                                                          
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
          } else if (convertToZero(differenceInDays) === 0) {
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
              to: user?.email,
              subject:
                "Ref : LeaderBridge | Your Premium Subscription has expired ",
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
                                                          <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                                          We hope you were able to spend the last 3 months exploring how LeaderBridge can help you in problem solving and get solutions to your question/concerns.   
                                                          </p><br/>
        
                                                          <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;"> 
                                                          Your premium subscription has expired. We have reverted you to our Free plan and premium features are not available for use. Upgrade now to continue using the premium features.  
                                                          </p>
        
                                                                 <button style="background-color: rgba(230, 25, 82, 1);color: rgba(255, 255, 255, 1);border: none;padding: 10px 20px;border-radius: 5px;cursor: pointer;display: flex;justify-content: center;align-items: center;text-align: center;margin: 10px auto 22px;"><a href="https://www.leaderbridge.com/setting-page" style="text-decoration: none; color: #fff;">Upgrade Now</a></button>
                                                          
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
            const UpdateUser = await global.models.GLOBAL.USER.findOneAndUpdate(
              {
                _id: ObjectId(user?._id),
              },
              {
                $set: {
                  paymentVerified: false,
                  userpurchasing: null,
                  planduration: null,
                },
              }
            );
          }
        }
      }

      async function CompanyisMoreThanThreeMonthsLater(startDate, validity) {
        // Pricing plan start date
        var startDate = new Date(startDate);

        // Pricing plan end date
        var endDate = new Date(validity);

        // Current date
        var currentDate = new Date();

        // Calculate the difference in milliseconds between the end date and current date
        var differenceInMilliseconds = endDate - currentDate;

        // Calculate the difference in days
        var differenceInDays = Math.floor(
          differenceInMilliseconds / (1000 * 60 * 60 * 24)
        );

        // Check if there are exactly 2 days left in the pricing plan
        console.log("AAAAAAAAASSSSSDDDDDDDDD", differenceInDays);
        if (differenceInDays > -2) {
          if (differenceInDays === 2) {
            console.log(
              "Congratulations! You have 2 days left in your pricing plan."
            );
            // Add your logic here for the 2-day notification or actions
          } else if (differenceInDays === 1) {
          } else if (differenceInDays === 0) {
            const UpdateUser = await global.models.GLOBAL.USER.findOneAndUpdate(
              {
                _id: ObjectId(FindUser?._id),
              },
              {
                $set: {
                  paymentVerified: false,
                  userpurchasing: null,
                  planduration: null,
                },
              }
            );
          } else {
            console.log(
              "You are not eligible for the 2-day notification in the pricing plan."
            );
            // Add your logic here for the regular flow or other notifications
          }
        }
      }

      async function CompanyExpriceDate(date, user) {
        var signupDate = new Date(date); // Replace with the actual signup date

        // Calculate the target date for the end of the 3-month period
        var targetDate = new Date(signupDate);
        targetDate.setMonth(targetDate.getMonth() + 3);

        // Calculate the difference in milliseconds between the current date and the target date
        var currentDate = new Date();
        var differenceInMilliseconds = targetDate - currentDate;

        // Calculate the difference in days
        var differenceInDays = Math.floor(
          differenceInMilliseconds / (1000 * 60 * 60 * 24)
        );

        if (differenceInDays > -2) {
          if (convertToZero(differenceInDays) === 2) {
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
              to: user?.email,
              subject:
                "Ref : LeaderBridge | Your Premium Subscription expires soon ",
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
                                                    <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                                    We hope you were able to spend the last 3 months exploring how LeaderBridge can help you in problem solving and get solutions to your question/concerns.  
                                                    </p><br/>
  
                                                    <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;"> 
                                                    Your premium subscription will end in ${Math.abs(
                                                      differenceInDays
                                                    )} days. When your Premium Subscription expires, you’ll revert to our Free plan and premium features will not be available for use. Upgrade now to continue using the premium features. 
                                                    </p>
  
                                                           <button style="background-color: rgba(230, 25, 82, 1);color: rgba(255, 255, 255, 1);border: none;padding: 10px 20px;border-radius: 5px;cursor: pointer;display: flex;justify-content: center;align-items: center;text-align: center;margin: 10px auto 22px;"><a href="https://www.leaderbridge.com/setting-page" style="text-decoration: none; color: #fff;">Upgrade Now</a></button>
                                                   
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
          } else if (convertToZero(differenceInDays) === 1) {
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
              to: user?.email,
              subject:
                "Ref : LeaderBridge | Your Premium Subscription expires soon ",
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
                                                        <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                                        We hope you were able to spend the last 3 months exploring how LeaderBridge can help you in problem solving and get solutions to your question/concerns.  
                                                        </p><br/>
      
                                                        <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;"> 
                                                        Your premium subscription will end in ${Math.abs(
                                                          differenceInDays
                                                        )} days. When your Premium Subscription expires, you’ll revert to our Free plan and premium features will not be available for use. Upgrade now to continue using the premium features. 
                                                        </p>
      
                                                               <button style="background-color: rgba(230, 25, 82, 1);color: rgba(255, 255, 255, 1);border: none;padding: 10px 20px;border-radius: 5px;cursor: pointer;display: flex;justify-content: center;align-items: center;text-align: center;margin: 10px auto 22px;"><a href="https://www.leaderbridge.com/setting-page" style="text-decoration: none; color: #fff;">Upgrade Now</a></button>
                                                        
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
          } else if (convertToZero(differenceInDays) === 0) {
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
              to: user?.email,
              subject:
                "Ref : LeaderBridge | Your Premium Subscription has expired ",
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
                                                        <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">
                                                        We hope you were able to spend the last 3 months exploring how LeaderBridge can help you in problem solving and get solutions to your question/concerns.   
                                                        </p><br/>
      
                                                        <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;"> 
                                                        Your premium subscription has expired. We have reverted you to our Free plan and premium features are not available for use. Upgrade now to continue using the premium features.  
                                                        </p>
      
                                                               <button style="background-color: rgba(230, 25, 82, 1);color: rgba(255, 255, 255, 1);border: none;padding: 10px 20px;border-radius: 5px;cursor: pointer;display: flex;justify-content: center;align-items: center;text-align: center;margin: 10px auto 22px;"><a href="https://www.leaderbridge.com/setting-page" style="text-decoration: none; color: #fff;">Upgrade Now</a></button>
                                                        
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
            const UpdateUser = await global.models.GLOBAL.USER.findOneAndUpdate(
              {
                _id: ObjectId(user?._id),
              },
              {
                $set: {
                  paymentVerified: false,
                  userpurchasing: null,
                  planduration: null,
                },
              }
            );
          }
        }
      }

      const userType = Promise.all(
        FindUser?.map(async (user) => {
          if (user?.isCompany == "individualCompany") {
            const Plan = await global.models.GLOBAL.MYPLAN.findOne({
              uid: ObjectId(user?._id),
            }).sort({ createdAt: -1 });
            // const FindCompanyUser = await global.models.GLOBAL.USER.find({
            //   isCompanyId: user?.isCompanyId,
            //   isCompanyVerify: null,
            //   paymentVerified: false,
            // });
            if (!Plan) {
              ExpriceDate(user.createdAt, user);
              //   if (!isMoreThanThreeMonthsLater(user.createdAt)) {
              //   } else {

              //   }
            } else {
              isMoreThanThreeMonthsLater(Plan.startDate, Plan.validity, user);
            }
          } else if (
            user?.isCompanyId &&
            !user?.isCompanyVerify &&
            !user?.isCompany
          ) {
            //   if (!user?.paymentVerified) {
            const Compnay = await global.models.GLOBAL.USER.findOne({
              isCompanyId: user?.isCompanyId,
              isCompanyVerify: true,
            });
            const Plan = await global.models.GLOBAL.MYPLAN.findOne({
              uid: ObjectId(Compnay?._id),
            }).sort({ createdAt: -1 });

            if (!Plan) {
              CompanyExpriceDate(Compnay.createdAt, user);
              //   if (!isMoreThanThreeMonthsLater(user.createdAt)) {
              //   } else {

              //   }
            } else {
              CompanyisMoreThanThreeMonthsLater(
                Plan.startDate,
                Plan.validity,
                user
              );
            }
            //   }
          }
        })
      ).then((data) => {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.SUCCESS,
          payload: FindUser,
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      });
    } catch (error) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.GENERAL,
        payload: error.message,
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
