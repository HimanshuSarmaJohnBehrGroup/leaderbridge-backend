const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Question from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    let criteria = {};
    const { id } = req.query;
    if (id) {
      criteria = {
        _id: id,
        status: true,
      };
    }
    try {
      let legends = await global.models.GLOBAL.LEGENDS.find(criteria).sort({
        legendsName: 1,
      });

      const fromIndex = legends.map((e) => e.legendsName).indexOf("Other"); // 👉️ 0
      const toIndex = legends?.length - 1;

      const element = legends.splice(fromIndex, 1)[0];

      legends.splice(toIndex, 0, element);

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: legends,
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
