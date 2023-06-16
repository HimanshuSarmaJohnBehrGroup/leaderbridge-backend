const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Get User by ID
module.exports = exports = {
  handler: async (req, res) => {
    let { user } = req;
    let { id } = req.params;
    let updateLegend;
    if (user.userType === enums.USER_TYPE.ADMIN) {
      let profileImage = req.file?.location;
      try {
        if (profileImage) {
          updateLegend = await global.models.GLOBAL.LEGENDS.findByIdAndUpdate(
            { _id: id },
            {
              $set: {
                ...req.body,
                legendsIcon: profileImage,
                updatedAt: Date.now(),
                updatedBy: user._id,
              },
            },
            { new: true }
          );
        } else {
          updateLegend = await global.models.GLOBAL.LEGENDS.findByIdAndUpdate(
            { _id: id },
            {
              $set: {
                ...req.body,
                updatedAt: Date.now(),
                updatedBy: user._id,
              },
            },
            { new: true }
          );
        }

        if (!updateLegend) {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.NOT_FOUND,
            payload: {},
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.NOT_FOUND)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_UPDATED,
            payload: { updateLegend },
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
    }
  },
};
