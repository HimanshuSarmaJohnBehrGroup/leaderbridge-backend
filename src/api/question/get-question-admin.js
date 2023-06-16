const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const ObjectId = require("mongodb").ObjectId;

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");

module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { question } = req.query;

    let criteria = {};

    try {
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;
      let count;
      let quResult;

      const questionDetais = await global.models.GLOBAL.QUESTION.find({})
        .populate({
          path: "createdBy",
          model: "user",
          select: "_id name subject profileImage currentRole",
        })
        .skip(skip)
        .limit(limit)
        .sort({
          createdAt: -1,
        })
        .exec();

      // today's Questions Count

      //Questions Profile access

      // Questions without profile Access

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_FETCHED,
        payload: {
          questions: questionDetais,

          page: page,
          limit: limit,
        },
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
