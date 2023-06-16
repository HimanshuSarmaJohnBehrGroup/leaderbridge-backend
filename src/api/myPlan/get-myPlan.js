const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all About Us from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      const { user } = req;
      let allPlan = await global.models.GLOBAL.MYPLAN.find({ uid: user._id });
      const today = new Date();
      const date = new Date(user.registrationDate);
      const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
      let havePlan = true;
      if (allPlan.length === 0) {
        if (diff <= 7) {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: {
              allPlan: [
                {
                  planName: "Free Plan",
                  planCost: 0,
                  planDescription: "Free Plan for 7 days",
                  validity: 7,
                  isActive: true,
                },
              ],
            },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      }
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_FETCHED,
        payload: { allPlan },
        logPayload: false,
      };

      return res
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
      return res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
