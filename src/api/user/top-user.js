const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Most Used Filter from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      let mostUsed = await global.models.GLOBAL.QUESTION.aggregate([
        { $project: { _id: 0, createdBy: 1 } },
        { $unwind: "$createdBy" },
        { $group: { _id: "$createdBy", use: { $sum: 1 } } },
        { $project: { _id: 0, createdBy: "$_id", use: 1 } },
        { $sort: { use: -1 } },
      ]);
      let newTopUser = [];
      let users = {};
      for (let i = 0; i < mostUsed.length; i++) {
        let answerCount = await global.models.GLOBAL.ANSWER.count({
          answerBy: mostUsed[i].createdBy,
        });
        let topUser = await global.models.GLOBAL.USER.find({
          _id: mostUsed[i].createdBy,
        });
        for (let j = 0; j < topUser.length; j++) {
          users = {
            name: topUser[j]?.name,
            email: topUser[j]?.email,
          };
        }
        topUser = [
          users,
          { questionByUser: mostUsed[i].use },
          { answerByuser: answerCount },
        ];
        newTopUser.push(topUser);
      }
      let topUsers = newTopUser.filter(function (el) {
        return el.length >= 1;
      });
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_FETCHED,
        payload: { topUsers },
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
