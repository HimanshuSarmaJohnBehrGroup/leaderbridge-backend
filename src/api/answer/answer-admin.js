const { ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  handler: async (req, res) => {
    const { user, questionId, status } = req;
    // const userData = utils.getHeaderFromToken(user);

    let everyone = await global.models.GLOBAL.ANSWER.find({
      question: ObjectId(questionId),
      createdBy: ObjectId(user),
    });

    if (everyone) {
      let updateAnswer = await global.models.GLOBAL.ANSWER.updateMany(
        {
          question: ObjectId(questionId),
          createdBy: ObjectId(user),
        },
        {
          $set: {
            status: 1,
          },
        },
        { new: true }
      );
      if (updateAnswer) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.ITEM_UPDATED,
          payload: {},
          logPayload: false,
        };
        return data4createResponseObject;
      }
    } else {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.ITEM_NOT_FOUND,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
    }
  },
};
