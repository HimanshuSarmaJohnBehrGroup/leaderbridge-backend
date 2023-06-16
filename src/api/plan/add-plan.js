const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");

const utils = require("../../utils");

// Add About Us by admin
module.exports = exports = {
  // route validation
  validation: Joi.object({
    planDescription: Joi.string().required(),
    planName: Joi.string().required(),
    planCost: Joi.number().required(),
    validity: Joi.number().required(),
    userType: Joi.string().required(),
    preLaunch: Joi.string().required(),
    type: Joi.string().required(),
  }),
  handler: async (req, res) => {
    const { user } = req;
    // if(user.type !== enums.USER_TYPE.ADMIN){
    //     const data4createResponseObject = {
    //         req: req,
    //         result: -1,
    //         message: messages.NOT_AUTHORIZED,
    //         payload: {},
    //         logPayload: false
    //     };
    //     return res.status(enums.HTTP_CODES.UNAUTHORIZED).json(utils.createResponseObject(data4createResponseObject));
    // }

    const {
      planCost,
      planName,
      planDescription,
      validity,
      type,
      preLaunch,
      userType,
    } = req.body;

    if (
      !planCost ||
      !planName ||
      !planDescription ||
      !validity ||
      !type ||
      !preLaunch ||
      !userType
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
      let newPlan = {
        planCost: planCost,
        planName: planName,
        planDescription: planDescription,
        validity: validity,
        type: type,
        userType: userType,
        preLaunch: preLaunch,
        createdBy: user._id,
        updatedBy: user._id,
      };
      const addNewPlan = await global.models.GLOBAL.PLAN(newPlan);
      await addNewPlan.save();
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
    } catch (error) {
      console.log("errorerror", error);
      logger.error(
        `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
      );
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.GENERAL,
        payload: { error },
        logPayload: false,
      };

      return res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
