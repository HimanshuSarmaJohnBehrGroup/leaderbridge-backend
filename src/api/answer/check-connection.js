const { ObjectId, ObjectID } = require("mongodb");
const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  // route validation

  handler: async (req, res) => {
    const { roomId, question } = req;
    let user = await utils.getHeaderFromToken(req.user);

    try {
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: question,
      });
      let findAnswer1 = await global.models.GLOBAL.ANSWER.find({
        roomId: roomId,
        createdBy: ObjectID(user.id),
      });
      let findAnswer2 = await global.models.GLOBAL.ANSWER.find({
        roomId: roomId,
        // createdBy: ObjectId("636b74617a3ce63a87b81331") ,
        createdBy: ObjectId(findQuestion?.createdBy),
      });

      let CheckConnection =
        findAnswer1 &&
        findAnswer1.length > 0 &&
        findAnswer2 &&
        findAnswer2.length > 0
          ? true
          : false;
      const data4createResponseObject = {
        req: req,
        result: -1,
        // message: messages.GENERAL,
        payload: { CheckConnection },
        logPayload: false,
      };
      return data4createResponseObject;
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
      return data4createResponseObject;
    }
  },
};
