const Joi = require("joi");
const { ObjectId } = require("mongodb");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Update Answer
module.exports = exports = {
  // route validation
  validation: Joi.object({
    answer: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { answerId } = req.params;
    const { answer } = req.body;
    if (!answerId || !answer) {
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
    // // console.log("USER--->>>", user);
    try {
      const updateAnswer = await global.models.GLOBAL.ANSWER.findOneAndUpdate(
        { _id: answerId, createdBy: user._id },
        {
          $set: {
            answer: answer,
            updatedAt: Date.now(),
            updatedBy: user._id,
            isUpdated: true,
          },
        },
        {
          new: true,
        }
      );
      // // console.log("UPDATE---->>", updateAnswer);
      let updateLastMessage =
        await global.models.GLOBAL.ANSWER_ROOM.findOneAndUpdate(
          {
            "lastMessage.answerId": ObjectId(answerId),
          },
          {
            $set: {
              "lastMessage.answer": answer,
            },
          }
        );
      // // console.log("ROOM-UPDATE--->>", updateLastMessage);
      if (updateAnswer) {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_UPDATED,
          payload: { updateAnswer },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: "Something Went wrong to Update Answer",
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
