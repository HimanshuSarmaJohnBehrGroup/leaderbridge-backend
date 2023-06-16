const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      let { user } = req;
      let { room } = req.params;
      let abuseAnswer = [];
      for (var i = 0; i < user.abuseAnswer.length; i++) {
        abuseAnswer.push(user.abuseAnswer[i].answerId);
      }
      // // console.log("ABUSE--->>", abuseAnswer);
      let findAnswerRoom = await global.models.GLOBAL.ANSWER_ROOM.aggregate([
        {
          $match: {
            _id: room,
          },
        },
        {
          $unwind: {
            path: "$answer",
          },
        },
        {
          $match: {
            "answer._id": {
              $nin: abuseAnswer,
            },
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "answer.answerBy",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $lookup: {
            from: "question",
            localField: "questionId",
            foreignField: "_id",
            as: "question",
          },
        },
        {
          $project: {
            _id: 1,
            participateIds: 1,
            createdAt: 1,
            answer: 1,
            "user._id": 1,
            "user.profileImage": 1,
            "user.currentRole": 1,
            "user.subject": 1,
            "user.email": 1,
            "user.region": 1,
            "user.name": 1,
            "user.countryOfResidence": 1,
            question: 1,
          },
        },
      ]);
      // // console.log("findAnswerRoom--->>", findAnswerRoom);

      let staredCount = await global.models.GLOBAL.ANSWER_ROOM.count({
        _id: room,
        "answer.answerBy": { $ne: user._id },
        "answer.messageStar": { $eq: true },
      });
      // // console.log("StarCOunt--->>>", staredCount);
      if (findAnswerRoom) {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_FETCHED,
          payload: { findAnswerRoom, staredCount },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.ITEM_NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.NOT_FOUND)
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
