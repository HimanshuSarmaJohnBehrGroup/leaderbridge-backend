const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const jwt = require("jsonwebtoken");
const jwtOptions = require("../../auth/jwt-options");

// User Login
module.exports = exports = {
  // route validation
  validation: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
    deviceToken: Joi.string().allow(),
  }),

  handler: async (req, res) => {
    const { planduration, userpurchasing, regular, preLaunch, skip } = req.body;
    const { id } = req.params;
    // if (!planduration || !userpurchasing) {
    //   const data4createResponseObject = {
    //     req: req,
    //     result: -1,
    //     message: messages.INVALID_PARAMETERS,
    //     payload: {},
    //     logPayload: false,
    //     status: enums.HTTP_CODES.BAD_REQUEST,
    //   };
    //   return res
    //     .status(enums.HTTP_CODES.BAD_REQUEST)
    //     .json(utils.createResponseObject(data4createResponseObject));
    // }

    try {
      if (skip) {
        const Updateuser = await global.models.GLOBAL.USER.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              skipPayment: skip,
            },
          },
          { new: true }
        );
      } else {
        const Updateuser = await global.models.GLOBAL.USER.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              userpurchasing: userpurchasing,
              planduration: planduration,
              regular: regular,
              preLaunch: preLaunch,
            },
          },
          { new: true }
        );
      }

      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.ITEM_INSERTED,
        payload: {},
        logPayload: false,
        status: enums.OK,
      };
      return res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    } catch (error) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
        status: enums.HTTP_CODES.INTERNAL_SERVER_ERROR,
      };
      return res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
