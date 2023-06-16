const { createCanvas, loadImage } = require("canvas");
const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const utils = require("../../utils");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const jwtOptions = require("../../auth/jwt-options");
const { ObjectId } = require("mongodb");

// User Registration
module.exports = exports = {
  validation: Joi.object({
    email: Joi.string().required(),
    organizationName: Joi.string().required(),
    currentRole: Joi.string().required(),
    region: Joi.string().required(),
    organizationEmail: Joi.string().required(),
    linkedinProfile: Joi.string().required(),
    organizationWebsite: Joi.string().allow(""),
    // otherLink: Joi.string().allow(""),
    howDidFind: Joi.string().required(),
    subject: Joi.array().required(),
  }),

  handler: async (req, res) => {
    const {
      email,
      organizationName,
      currentRole,
      region,
      organizationEmail,
      linkedinProfile,
      organizationWebsite,
      otherLink,
      howDidFind,
      subject,
    } = req.body;
    if (
      !organizationName ||
      !currentRole ||
      !region ||
      !organizationEmail ||
      !linkedinProfile ||
      !subject
    ) {
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
      let findUser = await global.models.GLOBAL.USER.findOne({
        $or: [{ email: { $eq: email } }],
      });
      if (findUser) {
        if (currentRole) {
          const GetFilterstion = await global.models.GLOBAL.FILTER.findOne({
            filterTypeId: ObjectId("6188f2c9603a571b33b0957d"),

            $and: [
              {
                "options.optionName": currentRole,
              },
            ],
          });

          const updatedOptions = GetFilterstion.options.filter(
            (option) => option.optionName == currentRole
          );

          // await GetFilterstion.save();

          console.log("GetFilterstionGetFilterstion", GetFilterstion);

          const ChangeFilterData = {
            name: GetFilterstion?.name,
            filterTypeId: GetFilterstion?.filterTypeId,
            status: GetFilterstion?.status,
            userId: findUser?._id,
            options: updatedOptions,
            filterId: GetFilterstion._id,
            displayProfile: true,
            orders: 1,
            required: true,
          };

          const FindUserFilter = await global.models.GLOBAL.USER_FILTER.findOne(
            {
              userId: ObjectId(findUser._id),
              filterId: ObjectId(GetFilterstion._id),
            }
          );

          if (FindUserFilter) {
            const updateFilter =
              await global.models.GLOBAL.USER_FILTER.findOneAndUpdate(
                { userId: ObjectId(findUser._id) },
                { filterId: ObjectId(GetFilterstion._id) },
                { $set: { options: updatedOptions } }
              );
          } else {
            const createFilter = await global.models.GLOBAL.USER_FILTER.create(
              ChangeFilterData
            );
          }
        }

        if (subject.length > 3) {
          const GetFilterstion = await global.models.GLOBAL.FILTER.findOne({
            filterTypeId: ObjectId("6188f2c9603a571b33b0957d"),

            $and: [
              {
                "options.optionName": {
                  $in: subject,
                },
              },
            ],
          });

          const updatedOptions = GetFilterstion.options.filter((option) =>
            subject.includes(option.optionName)
          );

          const ChangeFilterData = {
            name: GetFilterstion?.name,
            filterTypeId: GetFilterstion?.filterTypeId,
            status: GetFilterstion?.status,
            userId: findUser?._id,
            options: updatedOptions,
            filterId: GetFilterstion._id,
            displayProfile: true,
            required: true,
            orders: 2,
            profileHide: true,
          };

          const FindUserFilter = await global.models.GLOBAL.USER_FILTER.findOne(
            {
              userId: ObjectId(findUser._id),
              filterId: ObjectId(GetFilterstion._id),
            }
          );

          if (FindUserFilter) {
            const updateFilter =
              await global.models.GLOBAL.USER_FILTER.findOneAndUpdate(
                { userId: ObjectId(findUser._id) },
                { filterId: ObjectId(GetFilterstion._id) },
                { $set: { options: updatedOptions } }
              );
          } else {
            const createFilter = await global.models.GLOBAL.USER_FILTER.create(
              ChangeFilterData
            );
          }
        }

        const ImagesList = await global.models.GLOBAL.LEGENDS.aggregate([
          {
            $match: { legendsName: { $in: subject } },
          },
          {
            $group: {
              _id: "$legendsIcon",
              legendsName: {
                $first: "$legendsName",
              },
            },
          },
        ]);

        let ArraySubject = [];
        subject.map((item, index) => {
          return ImagesList.map((ss, i) => {
            if (ss.legendsName == item) {
              ArraySubject.splice(index, 0, ss);
            }
          });
        });

        if (!ArraySubject) {
          return res.status(400).json({
            message: "Please provide 4 images",
          });
        } else {
          const canvasWidth = 1024;
          const canvasHeight = 1024;
          //load canvas
          const myCanvas = createCanvas(canvasWidth, canvasHeight, "PNG");
          const context = myCanvas.getContext("2d");

          //load images && draw image in existing canvas

          let imageWidth = 0;
          let imageHeight = 0;
          for (i = 0; i < ArraySubject.length; i++) {
            await loadImage(ArraySubject[i]._id).then(async (image) => {
              await context.drawImage(image, imageWidth, imageHeight);
              imageHeight =
                canvasHeight > imageHeight * 2 ? imageWidth : imageHeight;
              imageWidth =
                canvasWidth > imageWidth * 2 ? 0.5 * canvasHeight : 0;
            });
          }
          let image = await utils.uploadBase(
            myCanvas.toDataURL(),
            findUser._id
          );
          let fillForm = await global.models.GLOBAL.USER.findOneAndUpdate(
            { email: email.toLowerCase() },
            {
              $set: {
                profileImage: image,
                organizationName: organizationName,
                currentRole: currentRole,
                region: region,
                organizationEmail: organizationEmail,
                linkedinProfile: linkedinProfile,
                organizationWebsite: organizationWebsite,
                otherLink: otherLink,
                howDidFind: howDidFind,
                subject: subject,
                formFilled: true,
                paymentVerified: true,
              },
            },
            { new: true }
          );

          if (!fillForm) {
            const data4createResponseObject = {
              req: req,
              result: -1,
              message: messages.GENERAL,
              payload: {},
              logPayload: false,
            };
            return res
              .status(enums.HTTP_CODES.BAD_REQUEST)
              .json(utils.createResponseObject(data4createResponseObject));
          } else {
            const data4token = {
              id: findUser._id,
              date: Date.now(),
              environment: process.env.APP_ENVIRONMENT,
              email: email.toLowerCase(),
              userType: findUser.userType,
              subject: findUser.subject,
              abuseQuestion: findUser.abuseQuestion,
              currentRole: findUser.currentRole,
              abuseAnswer: findUser.abuseAnswer,
              scope: "signup",
            };

            if (subject?.length != 0) {
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
                subject: "LeaderBridge | Welcome",
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
                                        <span style="font-size: 16px; line-height: 22px; color: #323232; padding-bottom: 1.25rem; display: block;">Hello ${findUser.name},</span>
                                        <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0;">Welcome to LeaderBridge®!</p>
                                        
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:  60px 30px 30px 30px;">
                                        <span style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">Regards</span>
                                        <p style="font-size: 16px; line-height: 22px; color: #323232; margin: 0; font-weight: 500;">John Behr</p>
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

            console.log("DDDDDDDDDDDDDDDDD", findUser);

            let Responsive;
            if (
              findUser?.isCompanyVerify == true &&
              findUser?.OrgRanDomID &&
              !findUser?.isCompany
            ) {
              const organization = await global.models.GLOBAL.USER.findOne({
                OrgRanDomID: findUser.OrgRanDomID,
                isOrganization: true,
              });

              console.log(
                "QQQQQQQQQQQQQQQQQQQQQQQQQAAAAAAAAAAAAA",
                organization
              );
              if (organization?.paymentVerified && !findUser?.paymentVerified) {
                const planType = await global.models.GLOBAL.MYPLAN.findOne({
                  uid: organization._id,
                });
                if (organization?.userpurchasing == "Just me") {
                  Responsive = {
                    Payment: {
                      paymentVerified: true,
                      purchaseBy: "organization",
                      type: "Organization",
                      userPayment: "C-Suite",
                      plan: planType,
                      premium: true,
                      userDuration: organization?.planduration,
                      join: organization,
                    },
                  };
                } else if (organization?.userpurchasing != "Just me") {
                  Responsive = {
                    Payment: {
                      paymentVerified: true,

                      type: "Organization",
                      plan: planType,
                      purchaseBy: "organization",
                      premium: true,
                      userPayment: "complete",
                      userDuration: organization.planduration,
                      join: organization,
                    },
                  };
                }
              } else if (
                !organization?.paymentVerified &&
                !findUser?.paymentVerified
              ) {
                Responsive = {
                  Payment: {
                    paymentVerified: false,
                    type: "Organization",
                    purchaseBy: null,
                    plan: null,
                    premium: false,
                    userPayment: "incomplete",
                    userDuration: organization.planduration,
                    join: organization,
                  },
                };
              } else if (
                !organization?.paymentVerified &&
                findUser?.paymentVerified &&
                findUser?.userpurchasing != "Just me"
              ) {
                console.log("JJJJJJJJJJJJJJ2");
                const planType = await global.models.GLOBAL.MYPLAN.findOne({
                  uid: findUser._id,
                });
                Responsive = {
                  Payment: {
                    paymentVerified: true,
                    purchaseBy: "company",
                    type: "company",
                    premium: true,
                    plan: planType,
                    userPayment: "complete",
                    userDuration: findUser?.planduration,
                    join: findUser,
                  },
                };
              } else if (
                !organization?.paymentVerified &&
                findUser?.paymentVerified &&
                findUser?.userpurchasing == "Just me"
              ) {
                const planType = await global.models.GLOBAL.MYPLAN.findOne({
                  uid: findUser._id,
                });
                Responsive = {
                  Payment: {
                    paymentVerified: true,
                    purchaseBy: "company",
                    type: "company",
                    premium: true,
                    plan: planType,
                    userPayment: "C-Suite",
                    userDuration: findUser?.planduration,
                    join: findUser,
                  },
                };
              } else if (
                organization?.paymentVerified &&
                findUser?.paymentVerified
              ) {
                const planType = await global.models.GLOBAL.MYPLAN.findOne({
                  uid: findUser._id,
                });
                Responsive = {
                  Payment: {
                    paymentVerified: true,
                    type: "company",
                    purchaseBy: "user",
                    plan: planType,
                    premium: true,
                    userPayment: "complete",
                    userDuration: findUser?.planduration,
                    join: findUser,
                  },
                };
              }
            } else if (
              !findUser?.isCompanyVerify &&
              !findUser?.OrgRanDomID &&
              !findUser?.isCompany &&
              findUser?.isCompanyId
            ) {
              const Company = await global.models.GLOBAL.USER.findOne({
                isCompanyId: findUser?.isCompanyId,
                isCompanyVerify: true,
              });
              const organization = await global.models.GLOBAL.USER.findOne({
                OrgRanDomID: Company.OrgRanDomID,
                isOrganization: true,
              });

              if (
                organization?.userpurchasing == "C-Suite" &&
                !Company?.paymentVerified &&
                organization?.paymentVerified
              ) {
                const planType = await global.models.GLOBAL.MYPLAN.findOne({
                  uid: organization._id,
                });
                Responsive = {
                  Payment: {
                    paymentVerified: true,
                    perchesBy: "organization",
                    type: "companyuser",
                    plan: planType,
                    premium: true,
                    userPayment: "complete",
                    userDuration: organization?.planduration,
                    join: organization,
                  },
                };
              } else if (
                !organization?.paymentVerified &&
                Company?.paymentVerified &&
                Company?.userpurchasing == "C-Suite"
              ) {
                const planType = await global.models.GLOBAL.MYPLAN.findOne({
                  uid: organization._id,
                });
                Responsive = {
                  Payment: {
                    paymentVerified: true,
                    plan: planType,
                    purchaseBy: "Company",
                    type: "Company",
                    premium: true,
                    userPayment: "complete",
                    userDuration: organization?.planduration,
                    join: Company,
                  },
                };
              } else if (
                !organization?.paymentVerified &&
                Company?.paymentVerified &&
                Company?.userpurchasing == "Just me" &&
                !findUser.paymentVerified
              ) {
                const planType = await global.models.GLOBAL.MYPLAN.findOne({
                  uid: organization?._id,
                });
                Responsive = {
                  Payment: {
                    plan: planType,
                    purchaseBy: "company",
                    paymentVerified: true,
                    premium: false,
                    perches: Company,
                    type: "Companyuser",
                    userPayment: "JustMe",
                    userDuration: organization?.planduration,
                    join: Company,
                  },
                };
              } else if (
                !organization?.paymentVerified &&
                Company?.paymentVerified &&
                Company?.userpurchasing == "C-Suite"
              ) {
                const planType = await global.models.GLOBAL.MYPLAN.findOne({
                  uid: Company._id,
                });
                Responsive = {
                  Payment: {
                    paymentVerified: true,
                    plan: planType,
                    purchaseBy: "company",
                    type: "Company",
                    premium: true,
                    purchaseBy: Company?.name,
                    userPayment: "complete",
                    userDuration: organization?.planduration,
                    join: Company,
                  },
                };
              } else if (
                organization?.userpurchasing == "Just me" &&
                !Company?.paymentVerified &&
                organization?.paymentVerified
              ) {
                Responsive = {
                  Payment: {
                    paymentVerified: true,
                    plan: null,
                    premium: false,

                    purchaseBy: organization?.orgname,
                    type: "Organization",
                    userPayment: "JustMe",
                    userDuration: organization?.planduration,
                    join: organization,
                  },
                };
              } else if (
                Company?.paymentVerified &&
                organization?.paymentVerified &&
                Company?.userpurchasing == "C-Suite" &&
                organization?.userpurchasing == "Just me"
              ) {
                const planType = await global.models.GLOBAL.MYPLAN.findOne({
                  uid: Company._id,
                });
                Responsive = {
                  Payment: {
                    paymentVerified: true,
                    type: "companyuser",
                    plan: planType,
                    purchaseBy: "company",
                    premium: true,
                    userPayment: "complete",
                    userDuration: organization?.planduration,
                    join: Company,
                  },
                };
              } else if (
                organization?.paymentVerified &&
                !Company?.paymentVerified &&
                organization?.userpurchasing == "Just me" &&
                findUser?.paymentVerified
              ) {
                const planType = await global.models.GLOBAL.MYPLAN.findOne({
                  uid: findUser._id,
                });
                Responsive = {
                  Payment: {
                    paymentVerified: true,
                    type: "company",
                    purchaseBy: "user",
                    plan: planType,
                    premium: true,
                    userPayment: "complete",
                    userDuration: findUser?.planduration,
                    join: findUser,
                  },
                };
              } else if (
                !organization?.paymentVerified &&
                Company?.paymentVerified &&
                Company?.userpurchasing == "Just me" &&
                findUser?.paymentVerified
              ) {
                const planType = await global.models.GLOBAL.MYPLAN.findOne({
                  uid: findUser?._id,
                });
                Responsive = {
                  Payment: {
                    paymentVerified: true,
                    type: "company",
                    purchaseBy: "user",
                    plan: planType,
                    premium: true,
                    userPayment: "complete",
                    userDuration: findUser?.planduration,
                    join: findUser,
                  },
                };
              } else if (
                !organization?.paymentVerified &&
                !Company?.paymentVerified &&
                findUser?.paymentVerified
              ) {
                const planType = await global.models.GLOBAL.MYPLAN.findOne({
                  uid: findUser?._id,
                });
                Responsive = {
                  Payment: {
                    paymentVerified: true,
                    type: "company",
                    plan: planType,
                    purchaseBy: "user",
                    premium: true,
                    userPayment: "complete",
                    userDuration: findUser?.planduration,
                    join: findUser,
                  },
                };
              } else if (
                !organization?.paymentVerified &&
                !Company?.paymentVerified &&
                !findUser?.paymentVerified
              ) {
                const planType = await global.models.GLOBAL.MYPLAN.findOne({
                  uid: findUser._id,
                });
                Responsive = {
                  Payment: {
                    paymentVerified: false,
                    type: "user",
                    plan: null,
                    purchaseBy: null,
                    premium: false,
                    userPayment: "incomplete",
                    userDuration: findUser?.planduration,
                    join: findUser,
                  },
                };
              }
            } else if (
              findUser?.isCompanyVerify &&
              !findUser?.OrgRanDomID &&
              findUser?.isCompanyId &&
              findUser?.isCompany == "individualCompany"
            ) {
              if (findUser?.paymentVerified) {
                const planType = await global.models.GLOBAL.MYPLAN.findOne({
                  uid: findUser._id,
                });
                Responsive = {
                  Payment: {
                    paymentVerified: true,
                    purchaseBy: "user",
                    type: "user",
                    plan: planType,
                    premium: true,
                    userPayment: "complete",
                    userDuration: findUser?.planduration,
                    join: findUser,
                  },
                };
              } else {
                Responsive = {
                  Payment: {
                    paymentVerified: false,
                    type: "user",
                    plan: null,
                    premium: false,
                    userPayment: "incomplete",
                    userDuration: null,
                    join: null,
                  },
                };
              }
            } else if (
              findUser?.OrgRanDomID &&
              findUser?.isOrganization == true
            ) {
              const paymentVerified = await global.models.GLOBAL.MYPLAN.findOne(
                {
                  uid: findUser._id,
                }
              );

              console.log("FFFFFFFFFFFFF", findUser.OrgRanDomID);

              const company = await global.models.GLOBAL.USER.findOne({
                OrgRanDomID: findUser.OrgRanDomID,
                isCompanyVerify: true,
              });

              let PaymentPlan;

              if (company) {
                PaymentPlan = await global.models.GLOBAL.MYPLAN.findOne({
                  uid: company?._id,
                });
              }

              if (
                findUser?.paymentVerified &&
                paymentVerified?.userpurchasing == "Just me" &&
                !PaymentPlan
              ) {
                const planType = await global.models.GLOBAL.MYPLAN.findOne({
                  uid: findUser._id,
                });

                Responsive = {
                  Payment: {
                    paymentVerified: true,
                    purchaseBy: "user",
                    type: "user",
                    plan: planType,
                    premium: true,
                    userPayment: "C-Suite",
                    userDuration: findUser.planduration,
                    join: findUser,
                  },
                };
              } else if (
                findUser?.paymentVerified &&
                paymentVerified?.userpurchasing == "Just me" &&
                PaymentPlan?.userpurchasing == "C-Suite"
              ) {
                Responsive = {
                  Payment: {
                    paymentVerified: true,
                    type: "company",
                    purchaseBy: "company",
                    plan: PaymentPlan,
                    premium: true,
                    userPayment: "complete",
                    userDuration: PaymentPlan.planduration,
                    join: PaymentPlan,
                  },
                };
              } else if (
                findUser?.paymentVerified &&
                paymentVerified?.userpurchasing == "C-Suite" &&
                !PaymentPlan
              ) {
                const planType = await global.models.GLOBAL.MYPLAN.findOne({
                  uid: findUser._id,
                });

                Responsive = {
                  Payment: {
                    paymentVerified: true,
                    type: "organization",
                    plan: planType,
                    purchaseBy: "organization",
                    premium: true,
                    userPayment: "complete",
                    userDuration: findUser.planduration,
                    join: findUser,
                  },
                };
              } else if (!findUser.paymentVerified && !PaymentPlan) {
                Responsive = {
                  Payment: {
                    paymentVerified: false,
                    type: "organization",
                    plan: PaymentPlan,
                    userPayment: "incomplete",
                    userDuration: null,
                    join: PaymentPlan,
                  },
                };
              }
            } else if (
              !findUser?.isCompanyVerify &&
              !findUser?.OrgRanDomID &&
              !findUser?.isCompanyId &&
              !findUser?.isCompany
            ) {
              if (findUser?.paymentVerified) {
                const planType = await global.models.GLOBAL.MYPLAN.findOne({
                  uid: findUser._id,
                });
                Responsive = {
                  Payment: {
                    paymentVerified: true,
                    purchaseBy: "user",
                    type: "user",
                    plan: planType,
                    premium: true,
                    userPayment: "complete",
                    userDuration: findUser.planduration,
                    join: findUser,
                  },
                };
              } else {
                Responsive = {
                  Payment: {
                    paymentVerified: false,
                    type: "user",
                    plan: null,
                    premium: false,
                    userPayment: "incomplete",
                    userDuration: null,
                    join: null,
                  },
                };
              }
            } else {
              // const planType = await global.models.GLOBAL.MYPLAN.findOne({
              //   uid: findUser._id,
              // });
              Responsive = {
                Payment: {
                  paymentVerified: false,
                  type: "user",
                  plan: null,
                  premium: false,
                },
              };
            }

            // console.log("Message sent: %s", info.messageId);
            const data4createResponseObject = {
              req: req,
              result: 0,
              message: messages.ITEM_UPDATED,
              payload: {
                fillForm,
                Responsive: Responsive,
                token: jwt.sign(data4token, jwtOptions.secretOrKey),
              },
              logPayload: false,
            };
            return res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          }
        }
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.USER_DOES_NOT_EXIST,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.NOT_FOUND)
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
