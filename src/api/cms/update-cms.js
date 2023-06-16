const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");

// Add category by admin
module.exports = exports = {
  // route validation
  validation: Joi.object({
    title: Joi.string().allow(),
    description: Joi.string().allow(),
    isActive: Joi.boolean().allow(),
  }),

  handler: async (req, res) => {
    const { cmsId } = req.query;
    const { title, description, isActive } = req.body;
    if (!cmsId) {
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

    const cmsExists = await global.models.GLOBAL.CMS.findById(cmsId);
    if (!cmsExists) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: "cms does not exists in system",
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    var today = new Date();
    var MonthEnd = today.getMonth();
    var Months = MonthEnd < 10 ? "0" + MonthEnd : MonthEnd;

    var DateFormate =
      today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
    var date = today.getFullYear() + "-" + Months + "-" + DateFormate;
    var TimeMent =
      today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
    var time = today.getHours() + ":" + TimeMent + ":" + today.getSeconds();
    var dateTime = date + " " + time;
    var rrrrr = date + "T" + time + "Z";

    let DDDD = new Date(
      today.getFullYear(),
      Months,
      DateFormate,
      today.getHours(),
      TimeMent,
      today.getSeconds()
    );

    // DDD.toISOString();

    // );

    let updationCriteria = {};
    if (title) {
      updationCriteria.title = title;
    }
    if (description) {
      updationCriteria.description = description;
      updationCriteria.updatedAt = new Date(
        today.getFullYear(),
        Months,
        DateFormate,
        today.getHours(),
        TimeMent,
        today.getSeconds()
      );
    }
    if (isActive !== undefined) {
      updationCriteria.isActive = isActive;
      updationCriteria.updatedAt = new Date(
        today.getFullYear(),
        Months,
        DateFormate,
        today.getHours(),
        TimeMent,
        today.getSeconds()
      );
    }

    // // console.log("updationCriteria",updationCriteria);

    try {
      const updatedCms = await global.models.GLOBAL.CMS.findByIdAndUpdate(
        cmsId,
        updationCriteria,
        // { updatedAt: new Date() },
        { new: true }
      );
      if (updatedCms) {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.SUCCESS,
          payload: { updatedCms },
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
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
