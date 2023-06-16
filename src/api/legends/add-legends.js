const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const utils = require("../../utils");

// Legends Create
module.exports = exports = {
  // route validation
  validation: Joi.object({
    // legendsIcon: Joi.string().required(),
    legendsName: Joi.string().required(),
    legendsDescription: Joi.string().allow(""),
  }),

  handler: async (req, res) => {
    const { user } = req;
    const { legendsName, legendsDescription } = req.body;
    if (!legendsDescription || !legendsName) {
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
      let findLegends = await global.models.GLOBAL.LEGENDS.find({
        $and: [
          {
            $or: [{ legendsName: { $eq: legendsName } }],
          },
        ],
      });
      if (findLegends.length > 0) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.ITEM_EXISTS,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        let profileImage = req?.file?.location;
        let legendsCreate = {
          legendsIcon: profileImage,
          legendsName: legendsName,
          legendsDescription: legendsDescription,
          createdAt: Date.now(),
          createdBy: user._id,
        };
        if (user.userType === enums.USER_TYPE.ADMIN) {
          const newLegend = await global.models.GLOBAL.LEGENDS(legendsCreate);
          try {
            await newLegend.save();
            const data4createResponseObject = {
              req: req,
              result: 0,
              message: "Legends Created Successfully",
              payload: newLegend,

              logPayload: false,
            };
            res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          } catch (error) {
            logger.error(
              `${req.originalUrl} - Error encountered while trying to add new Legends:\n ${error.message}\n${error.stack}`
            );
            const data4createResponseObject = {
              req: req,
              result: -1,
              message:
                "Sorry, Something Went wrong to create Legends.Please try again.",
              payload: {},
              logPayload: false,
            };
            return res
              .status(enums.HTTP_CODES.BAD_REQUEST)
              .json(utils.createResponseObject(data4createResponseObject));
          }
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
