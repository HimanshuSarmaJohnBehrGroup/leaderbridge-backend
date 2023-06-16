const { ObjectID, ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Remove Answer
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { answerId, userId } = req.params;
    if (!answerId) {
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };
      data4createResponseObject;
    }

    console.log("answerId---->AAAAAAAAAAAAAAAAAAAAAAAA", answerId);
    try {
      const answerExists = await global.models.GLOBAL.ANSWER.findOne({
        _id: answerId,
      });
      // // console.log("USER---->>", user._id);
      // // console.log("ANS---->>>", answerExists);
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: answerExists.question,
      });
      if (findQuestion) {
        const updatedQue = await global.models.GLOBAL.QUESTION.updateOne(
          { _id: answerExists.question },
          { $inc: { response: -1 } },
          { new: true }
        );
        const deleteAnswer = await global.models.GLOBAL.ANSWER.findOneAndRemove(
          {
            _id: answerId,
          }
        );

        const RemoveAbuseAnswer = await global.models.GLOBAL.USER.updateMany(
          { _id: userId },
          { $pull: { abuseAnswer: { answerId: ObjectId(answerId) } } }
        );

        const FindAnswer = await global.models.GLOBAL.ANSWER.findOne({
          roomId: answerExists.roomId,
        }).sort({ createdAt: -1 });

        let lastMessageObj = {};

        if (FindAnswer) {
          lastMessageObj = {
            answerId: FindAnswer._id,
            answer: FindAnswer.answer,
            createdAt: Date.now(),
          };
        }

        let addLastMessage =
          await global.models.GLOBAL.ANSWER_ROOM.findOneAndUpdate(
            {
              _id: answerExists.roomId,
            },
            { $set: { lastMessage: lastMessageObj } },
            { new: true }
          );

        const findAnswerData = await global.models.GLOBAL.ANSWER.findOne({
          question: answerExists.question,
          createdBy: answerExists.createdBy,
        });

        if (!findAnswerData) {
          const updatedQue = await global.models.GLOBAL.QUESTION.updateOne(
            { _id: answerExists.question },
            { $inc: { room: -1 } },
            { new: true }
          );
        }

        if (deleteAnswer) {
          const data4createResponseObject = {
            // req: req,
            result: 0,
            message: "Answer deleted successfully",
            payload: {},
            logPayload: false,
          };

          res.status(enums.HTTP_CODES.OK).json(data4createResponseObject);
        } else {
          const data4createResponseObject = {
            // req: req,
            result: -1,
            message: messages.NOT_ALLOWED,
            payload: {},
            logPayload: false,
          };
          res.status(enums.HTTP_CODES.OK).json(data4createResponseObject);
        }
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
    } catch (error) {
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      res.status(enums.HTTP_CODES.OK).json(data4createResponseObject);
    }
  },
};
