const { ObjectId } = require("bson");
const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  // route validation
  //   validation: Joi.object({
  //     name: Joi.string(),
  //     optionId: Joi.string(),
  //     optionName: Joi.string(),
  //     status: Joi.string(),
  //     filterStatus: Joi.boolean(),
  //   }),

  handler: async (req, res) => {
    const { user } = req;
    const { Filters } = req.body;

    try {
      const UpdateDataId = Filters?.map(async (obj) => {
        if (obj?.filterId == "619e0b3e641d2f00f887ec9b") {
          if (obj?.options?.length > 0) {
            const deleteFilter =
              await global.models.GLOBAL.USER_FILTER.deleteMany(
                {
                  userId: ObjectId(user._id),
                },
                {
                  filterId: {
                    $not: { $eq: ObjectId("63622d77abfdaa1f6a911c51") },
                  },
                }
              );
          } else {
            const deleteFilter =
              await global.models.GLOBAL.USER_FILTER.deleteMany(
                {
                  userId: ObjectId(user._id),
                },
                {
                  filterId: {
                    $not: { $eq: ObjectId("619e0b3e641d2f00f887ec9b") },
                  },
                },
                {
                  filterId: {
                    $not: { $eq: ObjectId("63622d77abfdaa1f6a911c51") },
                  },
                }
              );
          }
        }
      });

      const findUser = await global.models.GLOBAL.USER.findOne({
        _id: ObjectId(user._id),
      }).select("currentRole");

      const updateOptions = Filters?.map((obj) => {
        return {
          ...obj,
          userId: ObjectId(user._id),
        };
      });

      const HandleUpdateOptions = updateOptions?.map(async (obj) => {
        if (obj?.filterId == "619e0b3e641d2f00f887ec9b") {
          if (obj?.options?.length > 0) {
            const UpdateOptions =
              await global.models.GLOBAL.USER.findOneAndUpdate(
                { _id: ObjectId(user._id) },
                { currentRole: obj?.options[0]?.optionName }
              );
          }
        }
      });

      const FindFilter = await Promise.all(
        updateOptions.map(async (obj) => {
          if (obj?.filterId == "619e0b3e641d2f00f887ec9b") {
            if (obj?.options?.length == 0) {
              return null;
            } else {
              return {
                ...obj,
              };
            }
          } else {
            return {
              ...obj,
            };
          }
        })
      );

      const RmoveNull = FindFilter.filter((obj) => {
        return obj != null;
      });

      // console.log("RmoveNullRmoveNull", RmoveNull);

      if (RmoveNull.length != 0) {
        const createFilter = await global.models.GLOBAL.USER_FILTER.create(
          RmoveNull
        );
      }

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_INSERTED,
        payload: { Filters: RmoveNull },
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
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
