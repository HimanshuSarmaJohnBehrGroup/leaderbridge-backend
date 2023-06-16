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
    }

    console.log("QQQQQQQQQQQQQQQQQQQQQQQQ", userId, answerId);
    try {
      const answerExists = await global.models.GLOBAL.ANSWER.findOne({
        _id: answerId,
      });
      if (answerExists) {
        const updatedQue = await global.models.GLOBAL.USER.findOneAndUpdate(
          { _id: userId, "abuseAnswer.answerId": ObjectId(answerId) },

          { $set: { "abuseAnswer.$.status": false } }
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
