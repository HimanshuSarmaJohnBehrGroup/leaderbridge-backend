const Joi = require("joi");
const mongoose = require("mongoose");
const stripe = require("stripe")("sk_live_5BDYkgB6IvBRLrroeCNHhQR7");
//console.log("stripe", stripe);
// const stripe = require("stripe")(`${process.env.stripe_sk_test}`);
var ObjectID = require("mongodb").ObjectID;
const nodemailer = require("nodemailer");
const enums = require("../../../json/enums.json");
// const utils = require("../../utils");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const utils = require("../../utils");

module.exports = {
  validation: Joi.object({
    pid: Joi.string().required(),
    email: Joi.string().required(),
  }),
  pay: async (req, res, next) => {
    const { pid, email } = req.body;
    const { user } = req;

    if (!pid || !email) {
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
      let plan = await global.models.GLOBAL.PLAN.findById(pid);
      if (!plan) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.PLAN_NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.BAD_REQUEST)
          .json(utils.createResponseObject(data4createResponseObject));
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(plan?.planCost * 100),
        currency: "usd",
        // Verify your integration in this guide by including this parameter
        metadata: { integration_check: "accept_a_payment" },
        receipt_email: email,
        payment_method_types: ["card"],
        // receipt_menus: menus,
        description: "Payment for a service",
      });

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_INSERTED,
        // payload: { client_secret: plan },
        payload: { client_secret: paymentIntent["client_secret"] },
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    } catch (error) {
      console.log(error);
      next();
    }
  },

  careteIntent: async (req, res) => {
    try {
      const { user } = req;
      let {
        type,
        cardNumber,
        exp_month,
        exp_year,
        cvv,
        currency,
        amount,
        description,
        confirm,
        payment_method_types,
        shipping,
      } = req.body;
      // const validateMsg = validateEmptyFields(req.body, [
      //   "type",
      //   "amount",
      //   "cardNumber",
      //   "exp_month",
      //   "exp_year",
      //   "cvv",
      //   "currency",
      //   "confirm",
      //   "payment_method_types",
      //   "shipping",
      //   "description",
      // ]);
      if (
        !type ||
        !cardNumber ||
        !exp_month ||
        !exp_year ||
        !cvv ||
        !currency ||
        !amount ||
        !description ||
        !confirm ||
        !payment_method_types ||
        !shipping
      ) {
        return res.status(enums.HTTP_CODES.VALIDATION_ERROR).send({
          status: false,
          message: validateMsg,
          error: "validation error",
        });
      }
      if (type == "card") {
        // let package = await packageModel.findOne({ _id: packageId })
        // if (package) {
        let paymentMethod = await stripe.paymentMethods.create({
          type: type,
          card: {
            number: cardNumber,
            exp_month: exp_month,
            exp_year: exp_year,
            cvc: cvv,
          },
        });

        let paymentIntent = await stripe.paymentIntents.create({
          payment_method: paymentMethod.id,
          amount: amount * 100,
          currency: currency,
          confirm: confirm,
          description: description,
          shipping: shipping,
          payment_method_types: payment_method_types,
        });

        console.log(
          "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
          paymentIntent?.next_action?.stripe_js
        );
        if (paymentIntent.status == "succeeded") {
          return res.status(enums.HTTP_CODES.OK).send({
            status: true,
            paymentIntent: paymentIntent.id,
            message: "payment successfully done ",
            URL: paymentIntent?.next_action?.stripe_js,

            // transactionId: transaction._id,
          });
        } else if (paymentIntent.status == "requires_action") {
          return res.status(enums.HTTP_CODES.OK).send({
            status: false,
            message: "pending payment ",
            paymentIntent: paymentIntent,
            URL: paymentIntent?.next_action?.stripe_js,
          });
        } else {
          return res.status(enums.HTTP_CODES.BAD_REQUEST).send({
            status: false,
            message: "transactionError",
            error: "transaction status not succeeded",
          });
        }

        // if (paymentIntent?.next_action?.use_stripe_sdk?.stripe_js) {
        //   let url = paymentIntent?.next_action?.use_stripe_sdk?.stripe_js;

        //   let obj = {
        //     paymentIntentId: paymentIntent.id,
        //     secureUrl: url,
        //   };
        //   return res
        //     .status(enums.HTTP_CODES.OK)
        //     .send({ status: true, data: obj });
        // } else {
        //   return res.status(enums.HTTP_CODES.NOT_FOUND).send({
        //     staus: false,
        //     message: "payment intent creation error ",
        //   });
        // }
        // } else {
        //     return res.status(HTTP_CODES.NOT_FOUND).send({
        //         status: false,
        //         message: message.packageNotFound
        //     })
        // }
      } else {
        res.status(enums.HTTP_CODES.NOT_FOUND).send({
          staus: false,
          message: "wrong payment method",
        });
      }
    } catch (err) {
      res.status(enums.HTTP_CODES.BAD_REQUEST).send({
        staus: false,
        message: err.message,
      });
    }
  },

  retriveIntent: async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      // const validateMsg = validateEmptyFields(req.body, ["paymentIntentId"]);
      const { user } = req;
      if (!paymentIntentId) {
        return res.status(enums.HTTP_CODES.BAD_REQUEST).send({
          status: false,
          message: validateMsg,
          error: "Worng",
        });
      }
      let checkPaymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      let receipt = "";
      let receiptData = checkPaymentIntent.charges.data;
      if (receiptData) {
        receipt = receiptData[0]?.receipt_url;
      }

      // .populate({ "path": "packageId", "model": "package" })
      if (checkPaymentIntent.status == "succeeded") {
        return res.status(enums.HTTP_CODES.OK).send({
          status: true,
          message: "payment successfully done ",
          // transactionId: transaction._id,
        });
      } else if (checkPaymentIntent.status == "requires_action") {
        return res.status(enums.HTTP_CODES.BAD_REQUEST).send({
          status: false,
          message: "pending payment ",
        });
      } else {
        return res.status(enums.HTTP_CODES.BAD_REQUEST).send({
          status: false,
          message: "transactionError",
          error: "transaction status not succeeded",
        });
      }
    } catch (error) {
      res.status(enums.HTTP_CODES.BAD_REQUEST).send({
        staus: false,
        message: error.message,
        error: "something went wrong",
      });
    }
  },
};
