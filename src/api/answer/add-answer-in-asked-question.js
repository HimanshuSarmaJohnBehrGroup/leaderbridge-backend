const { ObjectID } = require("bson");
const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add Answer
module.exports = exports = {
  // route validation
  validation: Joi.object({
    roomId: Joi.string().required(),
    answer: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { questionId } = req.params;
    const { roomId, answer } = req.body;
    if (!questionId || !answer || !roomId) {
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
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: questionId,
      });
      if (findQuestion) {
        let findRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
          _id: roomId,
        });
        let addAnswer = {
          answer: answer,
          answerBy: user._id,
          question: questionId,
          answerAt: Date.now(),
        };
        const addNewAnswer = await global.models.GLOBAL.ANSWER.create(
          addAnswer
        );
        let newAnswer = {
          answerId: addNewAnswer._id,
          answer: answer,
          answerBy: user._id,
          answerAt: Date.now(),
        };
        let updateAnswer =
          await global.models.GLOBAL.ANSWER_ROOM.findOneAndUpdate(
            { _id: ObjectID(roomId) },
            {
              $push: {
                answer: newAnswer,
              },
            },
            { new: true }
          );

        let answerRoom = await global.models.GLOBAL.ANSWER_ROOM.find({
          _id: ObjectID(roomId),
        })
          .populate({
            path: "answer.answerBy",
            model: "user",
            select: "_id name email region currentRole profileImage subject",
          })
          .populate({
            path: "questionId",
            model: "question",
            select: "_id question response view createdBy",
          });
        if (updateAnswer) {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_INSERTED,
            payload: { answerRoom },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message:
              "Something went wrong to Add Answer, Please try agin later",
            payload: { updateAnswer },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.BAD_REQUEST)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: "Question Not Found",
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
