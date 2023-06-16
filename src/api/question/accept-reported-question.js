const { ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  handler: async (req, res) => {
    const { questionId, userId, status } = req.query;
    let questionExists = await global.models.GLOBAL.QUESTION.findById(
      questionId
    );
    if (questionId) {
      if (!questionExists) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.BAD_REQUEST)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    }
    try {
      if (status === "accept") {
        const RemoveAbuseAnswer = await global.models.GLOBAL.USER.updateMany(
          { _id: userId },
          { $pull: { abuseQuestion: { questionId: ObjectId(questionId) } } }
        );

        const updateAbuseQuestion =
          await global.models.GLOBAL.QUESTION.findOneAndRemove({
            _id: ObjectId(questionId),
          });

        const DeleteAnswer = await global.models.GLOBAL.ANSWER.deleteMany({
          question: ObjectId(questionId),
        });

        const DeleteAnswerRoom =
          await global.models.GLOBAL.ANSWER_ROOM.deleteMany({
            questionId: ObjectId(questionId),
          });

        const DeleteAnswerGroup =
          await global.models.GLOBAL.ANSWER_GROUP.deleteMany({
            questionId: ObjectId(questionId),
          });

        if (updateAbuseQuestion) {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_UPDATED,
            payload: { updateAbuseQuestion },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: "Somethings went wrong to get reported question",
            payload: {},
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.BAD_REQUEST)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else if (status === "reject") {
        const answerExists = await global.models.GLOBAL.QUESTION.findOne({
          _id: questionId,
        });
        if (answerExists) {
          const updatedQue = await global.models.GLOBAL.USER.findOneAndUpdate(
            { _id: userId, "abuseQuestion.questionId": ObjectId(questionId) },

            { $set: { "abuseQuestion.$.status": false } }
            // { $set: { isAbuse: true } },
          );

          // const updatedQue = await global.models.GLOBAL.USER.updateMany(
          //   { $set: { "abuseAnswer.status": true } }
          //   // { $set: { isAbuse: true } },
          // );

          console.log("updatedQue---->AAAAAAAAAAAAAAAAAAAAAAAA", updatedQue);

          const data4createResponseObject = {
            // req: req,
            result: 1,
            message: "Answer reject successfully.",
            payload: { answer: updatedQue },
            logPayload: false,
          };

          res.status(enums.HTTP_CODES.OK).json(data4createResponseObject);
        } else {
          const data4createResponseObject = {
            // req: req,
            result: -1,
            message: "Sorry, Something went wrong to delete answer.",
            payload: {},
            logPayload: false,
          };

          res.status(enums.HTTP_CODES.OK).json(data4createResponseObject);
        }
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: "Somethings went wrong to get reported question",
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.BAD_REQUEST)
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
