const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Most Used Filter from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      // let mostUsed = await global.models.GLOBAL.QUESTION.aggregate([
      //   { $project: { _id: 0, filter: 1 } },
      //   { $unwind: "$filter" },
      //   { $group: { _id: "$filter.filterId", use: { $sum: 1 } } },
      //   { $project: { _id: 0, filterId: "$_id", use: 1 } },
      //   { $sort: { use: -1 } },
      // ]);
      // let newTopSubject = [];
      // for (let i = 0; i < mostUsed.length; i++) {
      //   let topSubject = await global.models.GLOBAL.FILTER.find({
      //     _id: mostUsed[i].filterId,
      //   });
      //   topSubject = [...topSubject, { use: mostUsed[i].use }];
      //   newTopSubject.push(topSubject);
      // }
      // let topSubjects = newTopSubject.filter(function (el) {
      //   return el.length >= 1;
      // });

      let topSubjects = await global.models.GLOBAL.USER.aggregate([
        {
          $unwind: {
            path: "$subject",
          },
        },
        {
          $group: {
            _id: "$subject",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
        {
          $limit: 5,
        },
      ]);
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_FETCHED,
        payload: { topSubjects },
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
