const { stubTrue } = require("lodash");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const moment = require("moment");
const logger = require("../../logger");
const utils = require("../../utils");
const { getHeaderFromToken } = require("../../utils");

module.exports = exports = {
  //Router Handler
  handler: async (req, res) => {
    // console.log("userData", userId);
    const { userId } = req.params;
    const { isCompany, organizationId } = req.body;
    function checkExpiration(expirationDate) {
      var currentDate = new Date();
      var expiration = new Date(expirationDate);

      // Compare the current date with the expiration date
      if (currentDate.getTime() > expiration.getTime()) {
        return true;
      } else {
        return false;
      }
    }
    //Check userId is not null

    let findUser = await global.models.GLOBAL.USER.findOne({
      _id: userId,
    });

    console.log("QWWWWWWWWWWWWWWWWWWWWWW", userId);

    // if (
    //   FindExpericePlan &&
    //   checkExpiration(FindExpericePlan?.validity) &&
    //   month
    // ) {
    //   await global.models.GLOBAL.USER.findOneAndUpdate(
    //     { _id: userId },
    //     {
    //       $set: {
    //         paymentVerified: true,
    //       },
    //     },

    //     { new: true }
    //   );
    // }

    function convertToZero(value) {
      if (value < 0) {
        return 0;
      } else {
        return value;
      }
    }
    function isMoreThanThreeMonthsLater(createAt) {
      console.log("DSSSSSSSSSSSSSSSSSSSSSSS", createAt);

      // var currentDate = new Date();

      // // Define the target date
      // var targetDate = new Date(createAt);

      // // Calculate the difference in months
      // var monthDiff =
      //   (targetDate.getFullYear() - currentDate.getFullYear()) * 12;
      // monthDiff -= currentDate.getMonth() + 1;
      // monthDiff += targetDate.getMonth();
      // // monthDiff = Math.abs(monthDiff);
      // console.log("DSAQWWWWWWWWWWWWWW", monthDiff);

      var signupDate = new Date(createAt); // Replace with the actual signup date

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
      return convertToZero(differenceInDays) == 0;
      // return Math.abs(differenceInDays) == 0;
      // console.log("Minimum month difference:", Math.min(monthDiff, 0));
    }

    console.log("isCompanyVerifyisCompanyVerify", findUser?.isCompany);

    if (
      findUser?.isCompanyVerify == true &&
      findUser?.OrgRanDomID &&
      !findUser?.isCompany
    ) {
      const organization = await global.models.GLOBAL.USER.findOne({
        OrgRanDomID: findUser.OrgRanDomID,
        isOrganization: true,
      });

      if (isMoreThanThreeMonthsLater(organization?.createdAt)) {
        if (organization.paymentVerified && !findUser.paymentVerified) {
          const planType = await global.models.GLOBAL.MYPLAN.findOne({
            uid: organization._id,
          });
          if (organization.userpurchasing == "Just me") {
            const Responsive = {
              Payment: {
                paymentVerified: true,
                purchaseBy: "organization",
                type: "Organization",
                userPayment: "C-Suite",
                plan: planType,
                premium: true,
                userDuration: organization.planduration,
                join: organization,
              },
            };

            const data4createResponseObject = {
              req: req,
              result: 0,
              payload: { Responsive, findUser },
              message: messages.SUCCESS,
              logPayload: false,
            };
            return res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          } else if (organization.userpurchasing != "Just me") {
            const Responsive = {
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

            const data4createResponseObject = {
              req: req,
              result: 0,
              payload: { Responsive, findUser },
              message: messages.SUCCESS,
              logPayload: false,
            };
            return res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          }
        } else if (!organization.paymentVerified && !findUser.paymentVerified) {
          const Responsive = {
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

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (
          !organization.paymentVerified &&
          findUser.paymentVerified &&
          findUser.userpurchasing != "Just me"
        ) {
          const planType = await global.models.GLOBAL.MYPLAN.findOne({
            uid: findUser._id,
          });
          const Responsive = {
            Payment: {
              paymentVerified: true,
              purchaseBy: "company",
              type: "company",
              premium: true,
              plan: planType,
              userPayment: "complete",
              userDuration: findUser.planduration,
              join: findUser,
            },
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (
          !organization.paymentVerified &&
          findUser.paymentVerified &&
          findUser.userpurchasing == "Just me"
        ) {
          const planType = await global.models.GLOBAL.MYPLAN.findOne({
            uid: findUser._id,
          });
          const Responsive = {
            Payment: {
              paymentVerified: true,
              purchaseBy: "company",
              type: "company",
              premium: true,
              plan: planType,
              userPayment: "C-Suite",
              userDuration: findUser.planduration,
              join: findUser,
            },
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (organization.paymentVerified && findUser.paymentVerified) {
          if (
            findUser.userpurchasing == "Just me" &&
            organization.userpurchasing == "C-Suite"
          ) {
            const planType = await global.models.GLOBAL.MYPLAN.findOne({
              uid: organization._id,
            });
            const Responsive = {
              Payment: {
                paymentVerified: true,
                type: "organization",
                purchaseBy: "user",
                plan: planType,
                premium: true,
                userPayment: "complete",
                userDuration: findUser.planduration,
                join: findUser,
              },
            };

            const data4createResponseObject = {
              req: req,
              result: 0,
              payload: { Responsive, findUser },
              message: messages.SUCCESS,
              logPayload: false,
            };
            return res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          } else if (
            organization.userpurchasing == "Just me" &&
            findUser.userpurchasing == "C-Suite"
          ) {
            const planType = await global.models.GLOBAL.MYPLAN.findOne({
              uid: findUser._id,
            });
            const Responsive = {
              Payment: {
                paymentVerified: true,
                type: "company",
                purchaseBy: "user",
                plan: planType,
                premium: true,
                userPayment: "complete",
                userDuration: findUser.planduration,
                join: findUser,
              },
            };

            const data4createResponseObject = {
              req: req,
              result: 0,
              payload: { Responsive, findUser },
              message: messages.SUCCESS,
              logPayload: false,
            };
            return res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          }
          const planType = await global.models.GLOBAL.MYPLAN.findOne({
            uid: organization._id,
          });
          const Responsive = {
            Payment: {
              paymentVerified: true,
              type: "company",
              purchaseBy: "user",
              plan: planType,
              premium: true,
              userPayment: "complete",
              userDuration: findUser.planduration,
              join: findUser,
            },
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else {
        const Responsive = {
          Payment: {
            paymentVerified: true,
            perchesBy: "organization",
            type: "companyuser",
            plan: null,
            premium: true,
            userPayment: "free",
            userDuration: null,
            join: null,
          },
        };

        const data4createResponseObject = {
          req: req,
          result: 0,
          payload: { Responsive, findUser },
          message: messages.SUCCESS,
          logPayload: false,
        };

        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    } else if (
      findUser?.isCompanyVerify &&
      !findUser?.OrgRanDomID &&
      findUser?.isCompanyId &&
      findUser?.isCompany == "individualCompany"
    ) {
      // const createAtDate = new Date(findUser?.createdAt);
      // const createAtDate = new Date(findUser?.createdAt);
      // const currentDate = new Date();
      // // const createAtDate = new Date(Company?.createdAt);

      // // Add 3 months to the createAt date
      // createAtDate.setMonth(createAtDate.getMonth() + 3);
      // console.log("createAtDatecreateAtDate", createAtDate, currentDate);
      {
        console.log(
          "QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ",
          isMoreThanThreeMonthsLater(findUser?.createdAt)
        );
      }
      if (isMoreThanThreeMonthsLater(findUser?.createdAt)) {
        if (findUser?.paymentVerified) {
          const planType = await global.models.GLOBAL.MYPLAN.findOne({
            uid: findUser?._id,
          });
          const Responsive = {
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

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const Responsive = {
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

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else {
        const Responsive = {
          Payment: {
            paymentVerified: true,
            perchesBy: "organization",
            type: "companyuser",
            plan: null,
            premium: true,
            userPayment: "free",
            userDuration: null,
            join: null,
          },
        };

        const data4createResponseObject = {
          req: req,
          result: 0,
          payload: { Responsive, findUser },
          message: messages.SUCCESS,
          logPayload: false,
        };

        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    } else if (
      !findUser?.isCompanyVerify &&
      !findUser?.OrgRanDomID &&
      // !findUser.isCompany &&
      findUser?.isCompanyId
    ) {
      const Company = await global.models.GLOBAL.USER.findOne({
        isCompanyId: findUser.isCompanyId,
        isCompanyVerify: true,
      });
      const organization = await global.models.GLOBAL.USER.findOne({
        OrgRanDomID: Company.OrgRanDomID,
        isOrganization: true,
      });

      console.log("DDDDDDDDDDDDDSSSSSSSS", organization);

      if (Company.isCompany == "individualCompany") {
        // const date = new Date(Company?.createdAt);

        if (isMoreThanThreeMonthsLater(Company?.createdAt)) {
          const planType = await global.models.GLOBAL.MYPLAN.findOne({
            uid: Company._id,
          });
          if (
            planType?.userpurchasing == "C-Suite" &&
            Company?.paymentVerified &&
            !findUser?.paymentVerified
          ) {
            const planType = await global.models.GLOBAL.MYPLAN.findOne({
              uid: Company._id,
            });
            const Responsive = {
              Payment: {
                paymentVerified: true,
                perchesBy: "organization",
                type: "companyuser",
                plan: planType,
                premium: true,
                userPayment: "complete",
                userDuration: Company.planduration,
                join: organization,
              },
            };

            const data4createResponseObject = {
              req: req,
              result: 0,
              payload: { Responsive, findUser },
              message: messages.SUCCESS,
              logPayload: false,
            };

            return res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          } else if (
            planType?.userpurchasing == "Just me" &&
            Company?.paymentVerified &&
            !findUser?.paymentVerified
          ) {
            const planType = await global.models.GLOBAL.MYPLAN.findOne({
              uid: Company._id,
            });
            const Responsive = {
              Payment: {
                paymentVerified: true,
                perchesBy: "organization",
                type: "user",
                plan: planType,
                premium: true,
                userPayment: "C-Suite",
                userDuration: Company.planduration,
                join: organization,
              },
            };

            const data4createResponseObject = {
              req: req,
              result: 0,
              payload: { Responsive, findUser },
              message: messages.SUCCESS,
              logPayload: false,
            };

            return res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          } else if (!findUser?.paymentVerified && !Company?.paymentVerified) {
            // const planType = await global.models.GLOBAL.MYPLAN.findOne({
            //   uid: PaymentPlan._id,
            // });
            const Responsive = {
              Payment: {
                paymentVerified: false,
                type: "organization",
                plan: null,
                userPayment: "incomplete",
                userDuration: null,
                join: null,
              },
            };

            const data4createResponseObject = {
              req: req,
              result: 0,
              payload: { Responsive, findUser },
              message: messages.SUCCESS,
              logPayload: false,
            };
            return res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          } else if (findUser?.paymentVerified && !Company?.paymentVerified) {
            const planType = await global.models.GLOBAL.MYPLAN.findOne({
              uid: findUser._id,
            });
            const Responsive = {
              Payment: {
                paymentVerified: true,
                perchesBy: "organization",
                type: "user",
                plan: planType,
                premium: true,
                userPayment: "complete",
                userDuration: Company.planduration,
                join: organization,
              },
            };

            const data4createResponseObject = {
              req: req,
              result: 0,
              payload: { Responsive, findUser },
              message: messages.SUCCESS,
              logPayload: false,
            };

            return res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          }
        } else {
          const Responsive = {
            Payment: {
              paymentVerified: true,
              perchesBy: "organization",
              type: "companyuser",
              plan: null,
              premium: true,
              userPayment: "free",
              userDuration: null,
              join: null,
            },
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };

          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else {
        if (
          organization.userpurchasing == "C-Suite" &&
          !Company.paymentVerified &&
          organization.paymentVerified
        ) {
          const planType = await global.models.GLOBAL.MYPLAN.findOne({
            uid: organization._id,
          });
          const Responsive = {
            Payment: {
              paymentVerified: true,
              perchesBy: "organization",
              type: "companyuser",
              plan: planType,
              premium: true,
              userPayment: "complete",
              userDuration: organization.planduration,
              join: organization,
            },
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };

          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (
          !organization.paymentVerified &&
          Company.paymentVerified &&
          Company.userpurchasing == "C-Suite"
        ) {
          const planType = await global.models.GLOBAL.MYPLAN.findOne({
            uid: organization._id,
          });
          const Responsive = {
            Payment: {
              paymentVerified: true,
              plan: planType,
              purchaseBy: "Company",
              type: "Company",
              premium: true,
              userPayment: "complete",
              userDuration: organization.planduration,
              join: Company,
            },
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (
          !organization.paymentVerified &&
          Company.paymentVerified &&
          Company.userpurchasing == "Just me" &&
          !findUser.paymentVerified
        ) {
          const planType = await global.models.GLOBAL.MYPLAN.findOne({
            uid: organization._id,
          });
          const Responsive = {
            Payment: {
              plan: planType,
              purchaseBy: "company",
              paymentVerified: true,
              premium: false,
              perches: Company,
              type: "Companyuser",
              userPayment: "JustMe",
              userDuration: organization.planduration,
              join: Company,
            },
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (
          !organization.paymentVerified &&
          Company.paymentVerified &&
          Company.userpurchasing == "C-Suite"
        ) {
          const planType = await global.models.GLOBAL.MYPLAN.findOne({
            uid: Company._id,
          });
          const Responsive = {
            Payment: {
              paymentVerified: true,
              plan: planType,
              purchaseBy: "company",
              type: "Company",
              premium: true,
              purchaseBy: Company.name,
              userPayment: "complete",
              userDuration: organization.planduration,
              join: Company,
            },
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (
          organization.userpurchasing == "Just me" &&
          !Company.paymentVerified &&
          organization.paymentVerified
        ) {
          const Responsive = {
            Payment: {
              paymentVerified: true,
              plan: null,
              premium: false,

              purchaseBy: organization.orgname,
              type: "Organization",
              userPayment: "JustMe",
              userDuration: organization.planduration,
              join: organization,
            },
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (
          Company.paymentVerified &&
          organization.paymentVerified &&
          organization.userpurchasing == "C-Suite" &&
          Company.userpurchasing == "Just me"
        ) {
          const planType = await global.models.GLOBAL.MYPLAN.findOne({
            uid: organization._id,
          });
          const Responsive = {
            Payment: {
              paymentVerified: true,
              type: "organization",
              plan: planType,
              purchaseBy: "company",
              premium: true,
              userPayment: "complete",
              userDuration: organization.planduration,
              join: Company,
            },
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (
          Company.paymentVerified &&
          organization.paymentVerified &&
          Company.userpurchasing == "C-Suite" &&
          organization.userpurchasing == "Just me"
        ) {
          const planType = await global.models.GLOBAL.MYPLAN.findOne({
            uid: Company._id,
          });
          const Responsive = {
            Payment: {
              paymentVerified: true,
              type: "companyuser",
              plan: planType,
              purchaseBy: "company",
              premium: true,
              userPayment: "complete",
              userDuration: organization.planduration,
              join: Company,
            },
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (
          organization.paymentVerified &&
          !Company.paymentVerified &&
          organization.userpurchasing == "Just me" &&
          findUser.paymentVerified
        ) {
          const planType = await global.models.GLOBAL.MYPLAN.findOne({
            uid: findUser._id,
          });
          const Responsive = {
            Payment: {
              paymentVerified: true,
              type: "company",
              purchaseBy: "user",
              plan: planType,
              premium: true,
              userPayment: "complete",
              userDuration: findUser.planduration,
              join: findUser,
            },
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (
          !organization.paymentVerified &&
          Company.paymentVerified &&
          Company.userpurchasing == "Just me" &&
          findUser.paymentVerified
        ) {
          const planType = await global.models.GLOBAL.MYPLAN.findOne({
            uid: findUser._id,
          });
          const Responsive = {
            Payment: {
              paymentVerified: true,
              type: "company",
              purchaseBy: "user",
              plan: planType,
              premium: true,
              userPayment: "complete",
              userDuration: findUser.planduration,
              join: findUser,
            },
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (
          !organization.paymentVerified &&
          !Company.paymentVerified &&
          findUser.paymentVerified
        ) {
          const planType = await global.models.GLOBAL.MYPLAN.findOne({
            uid: findUser._id,
          });
          const Responsive = {
            Payment: {
              paymentVerified: true,
              type: "company",
              plan: planType,
              purchaseBy: "user",
              premium: true,
              userPayment: "complete",
              userDuration: findUser.planduration,
              join: findUser,
            },
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (
          !organization.paymentVerified &&
          !Company.paymentVerified &&
          !findUser.paymentVerified
        ) {
          const planType = await global.models.GLOBAL.MYPLAN.findOne({
            uid: findUser._id,
          });
          const Responsive = {
            Payment: {
              paymentVerified: false,
              type: "user",
              plan: null,
              purchaseBy: null,
              premium: false,
              userPayment: "incomplete",
              userDuration: findUser.planduration,
              join: findUser,
            },
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      }
    } else if (findUser?.OrgRanDomID && findUser?.isOrganization == true) {
      const paymentVerified = await global.models.GLOBAL.MYPLAN.findOne({
        uid: findUser?._id,
      });

      const company = await global.models.GLOBAL.USER.findOne({
        OrgRanDomID: findUser?.OrgRanDomID,
        isCompanyVerify: true,
      });

      let PaymentPlan;

      if (company) {
        PaymentPlan = await global.models.GLOBAL.MYPLAN.findOne({
          uid: company?._id,
        });
      }

      if (
        findUser.paymentVerified &&
        paymentVerified.userpurchasing == "Just me" &&
        !PaymentPlan
      ) {
        const planType = await global.models.GLOBAL.MYPLAN.findOne({
          uid: findUser?._id,
        });

        const Responsive = {
          Payment: {
            paymentVerified: true,
            purchaseBy: "user",
            type: "user",
            plan: planType,
            premium: true,
            userPayment: "C-Suite",
            userDuration: findUser?.planduration,
            join: findUser,
          },
        };

        const data4createResponseObject = {
          req: req,
          result: 0,
          payload: { Responsive, findUser },
          message: messages.SUCCESS,
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else if (
        findUser?.paymentVerified &&
        paymentVerified?.userpurchasing == "Just me" &&
        PaymentPlan?.userpurchasing == "C-Suite"
      ) {
        const Responsive = {
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

        const data4createResponseObject = {
          req: req,
          result: 0,
          payload: { Responsive, findUser },
          message: messages.SUCCESS,
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else if (
        findUser?.paymentVerified &&
        paymentVerified?.userpurchasing == "C-Suite" &&
        !PaymentPlan
      ) {
        const planType = await global.models.GLOBAL.MYPLAN.findOne({
          uid: findUser?._id,
        });

        const Responsive = {
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

        const data4createResponseObject = {
          req: req,
          result: 0,
          payload: { Responsive, findUser },
          message: messages.SUCCESS,
          logPayload: false,
        };

        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else if (!findUser?.paymentVerified && !PaymentPlan) {
        const Responsive = {
          Payment: {
            paymentVerified: false,
            type: "organization",
            plan: PaymentPlan,
            userPayment: "incomplete",
            userDuration: null,
            join: PaymentPlan,
          },
        };

        const data4createResponseObject = {
          req: req,
          result: 0,
          payload: { Responsive, findUser },
          message: messages.SUCCESS,
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else if (!findUser?.paymentVerified && company?.paymentVerified) {
        if (PaymentPlan?.userpurchasing == "C-Suite") {
          const Responsive = {
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

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (PaymentPlan?.userpurchasing == "Just me") {
          const Responsive = {
            Payment: {
              paymentVerified: true,
              type: "company",
              purchaseBy: "company",
              plan: PaymentPlan,
              premium: false,
              userPayment: "C-Suite",
              userDuration: PaymentPlan.planduration,
              join: PaymentPlan,
            },
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else if (findUser?.paymentVerified && company?.paymentVerified) {
        if (
          paymentVerified?.userpurchasing == "Just me" &&
          PaymentPlan?.userpurchasing == "C-Suite"
        ) {
          const Responsive = {
            Payment: {
              paymentVerified: true,
              type: "company",
              plan: PaymentPlan,
              purchaseBy: "organization",
              premium: true,
              userPayment: "complete",
              userDuration: PaymentPlan.planduration,
              join: findUser,
            },
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };

          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (
          PaymentPlan?.userpurchasing == "Just me" &&
          paymentVerified?.userpurchasing == "C-Suite"
        ) {
          const Responsive = {
            Payment: {
              paymentVerified: true,
              type: "company",
              plan: paymentVerified,
              purchaseBy: "company",
              premium: true,
              userPayment: "complete",
              userDuration: paymentVerified.planduration,
              join: findUser,
            },
          };

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };

          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      }
    } else if (
      !findUser?.isCompanyVerify &&
      !findUser?.OrgRanDomID &&
      !findUser?.isCompanyId &&
      !findUser?.isCompany
    ) {
      if (isMoreThanThreeMonthsLater(organization?.createdAt)) {
        if (findUser?.paymentVerified) {
          const planType = await global.models.GLOBAL.MYPLAN.findOne({
            uid: findUser?._id,
          });
          const Responsive = {
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

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const Responsive = {
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

          const data4createResponseObject = {
            req: req,
            result: 0,
            payload: { Responsive, findUser },
            message: messages.SUCCESS,
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else {
        const Responsive = {
          Payment: {
            paymentVerified: true,
            perchesBy: "organization",
            type: "companyuser",
            plan: null,
            premium: true,
            userPayment: "free",
            userDuration: null,
            join: null,
          },
        };

        const data4createResponseObject = {
          req: req,
          result: 0,
          payload: { Responsive, findUser },
          message: messages.SUCCESS,
          logPayload: false,
        };

        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    } else {
      const Responsive = {
        Payment: {
          paymentVerified: false,
          purchaseBy: "user",
          type: "user",
          plan: null,
          premium: false,
          userPayment: "failed",
          userDuration: findUser.planduration,
          join: findUser,
        },
      };

      const data4createResponseObject = {
        req: req,
        result: 0,
        payload: { Responsive, findUser },
        message: messages.SUCCESS,
        logPayload: false,
      };

      return res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    try {
      // console.log("updatedBlockUserList", updatedBlockUserList);
    } catch (error) {
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
    }
  },
};
