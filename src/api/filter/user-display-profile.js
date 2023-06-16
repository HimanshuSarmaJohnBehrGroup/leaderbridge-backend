const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const { ObjectId } = require("mongodb");

// Add category by admin
module.exports = exports = {
  // route validation
  // validation: Joi.object({
  //   name: Joi.string(),
  //   optionId: Joi.string(),
  //   optionName: Joi.string(),
  //   status: Joi.string(),
  //   filterStatus: Joi.boolean(),
  // }),

  handler: async (req, res) => {
    const { Authorize, single } = req.params;
    const { _id, displayProfile } = req.body;
    const { user } = req;
    if (!_id && single === true) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: "Please provide _id of filter",
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    // if (!Authorize && !single) {
    //   const data4createResponseObject = {
    //     req: req,
    //     result: -1,
    //     message: "Please provide Authorize in query params",
    //     payload: {},
    //     logPayload: false,
    //   };
    //   return res
    //     .status(enums.HTTP_CODES.BAD_REQUEST)
    //     .json(utils.createResponseObject(data4createResponseObject));
    // }

    try {
      if (single == "true") {
        const createFilter = await global.models.GLOBAL.USER_FILTER.findOne({
          _id: ObjectId(_id),
          userId: ObjectId(user._id),
        });

        if (createFilter) {
          const updateFilter =
            await global.models.GLOBAL.USER_FILTER.findOneAndUpdate(
              {
                userId: user._id,
                _id: _id,
              },
              {
                $set: {
                  displayProfile: displayProfile,
                },
              }
            );
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_UPDATED,
            payload: { updateFilter: updateFilter },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: "No filter found",
            payload: {},
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.BAD_REQUEST)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else if (single == "false") {
        console.log("user._id", user._id);
        const createFilter = await global.models.GLOBAL.USER_FILTER.find({
          userId: ObjectId(user._id),
        });

        if (createFilter) {
          const updateFilter =
            await global.models.GLOBAL.USER_FILTER.updateMany(
              {
                userId: user._id,
              },
              {
                $set: {
                  displayProfile: displayProfile,
                },
              }
            );
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_UPDATED,
            payload: { updateFilter: updateFilter },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: "No filter found",
            payload: {},
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.BAD_REQUEST)
            .json(utils.createResponseObject(data4createResponseObject));
        }
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
