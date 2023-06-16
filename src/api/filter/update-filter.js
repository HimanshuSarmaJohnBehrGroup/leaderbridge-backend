const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  // route validation
  validation: Joi.object({
    name: Joi.string(),
    optionId: Joi.string(),
    optionName: Joi.string(),
    status: Joi.string(),
    filterStatus: Joi.boolean(),
    multiSelect: Joi.boolean(),
    profileHide: Joi.boolean(),
    required: Joi.boolean(),
    optional: Joi.boolean(),
  }),

  handler: async (req, res) => {
    const { filterId, roleFilter } = req.query;
    const { name, optionId, optionName, status, filterStatus, optional } =
      req.body;
    const filterExists = await global.models.GLOBAL.FILTER.findById(filterId);
    if (!filterExists) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: "filter does not exists in system",
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    try {
      let updateData = {};
      let set = {};
      if (name) {
        updateData.name = name;
        updateData.multiSelect = req.body.multiSelect;
        updateData.profileHide = req.body.profileHide;
        updateData.required = req.body.required;

        set = { $set: updateData };
        const updatefilterType =
          await global.models.GLOBAL.FILTER.findByIdAndUpdate(filterId, set, {
            new: true,
          });

        await global.models.GLOBAL.USER_FILTER.updateMany(
          { filterId: filterId },
          set,
          {
            new: true,
          }
        );
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_UPDATED,
          payload: { updatefilterType },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else if (optionId && optionName) {
        // updateData.$.optionName = optionName;
        set = {
          $set: {
            "options.$.optionName": optionName,
            "options.$.optional": optional,
          },
        };
        const updatefilterType = await global.models.GLOBAL.FILTER.update(
          { _id: filterId, "options._id": optionId },
          set,
          { new: true }
        );

        await global.models.GLOBAL.USER_FILTER.update(
          { filterId: filterId, "options._id": optionId },
          set,
          { new: true }
        );
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_UPDATED,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else if ((status !== undefined || null || "") && !filterStatus) {
        set = { $set: { "options.$.status": status } };
        const updatefilterType = await global.models.GLOBAL.FILTER.update(
          { _id: filterId, "options._id": optionId },
          set,
          { new: true }
        );

        await global.models.GLOBAL.USER_FILTER.update(
          { filterId: filterId, "options._id": optionId },
          set,
          { new: true }
        );
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_UPDATED,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else if (filterStatus) {
        const updatefilterType = await global.models.GLOBAL.FILTER.updateMany(
          { _id: filterId },
          {
            $set: {
              status: status,
            },
          }
        );

        await global.models.GLOBAL.USER_FILTER.updateMany(
          { filterId: filterId },
          {
            $set: {
              status: status,
            },
          }
        );

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_UPDATED,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: "Provide necessary data for updation.",
          payload: {},
          logPayload: false,
        };
        res
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
