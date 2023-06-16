const { ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");

const utils = require("../../utils");

module.exports = exports = {
  //Router Handler
  handler: async ({ user, questionId }) => {
    const userData = await utils.getHeaderFromToken(user);
    let everyoneAnswer = await global.models.GLOBAL.ANSWER.find({
      question: questionId,
      createdBy: userData.id,
      status: 1,
    });

    let Authorcan = await global.models.GLOBAL.ANSWER.find({
      question: questionId,
      createdBy: userData.id,
      status: 0,
    });

    if (Authorcan.length != 0) {
      const data4createResponseObject = {
        req: {},
        result: -1,
        message: "success",
        payload: { message: "Everyone can see" },
        logPayload: false,
      };
      return data4createResponseObject;
    } else if (everyoneAnswer.length != 0) {
      const data4createResponseObject = {
        req: {},
        result: -1,
        message: "success",
        payload: { message: "Only can see admin" },
        logPayload: false,
      };
      return data4createResponseObject;
    } else if (everyoneAnswer.length == 0 && Authorcan.length == 0) {
      const data4createResponseObject = {
        req: {},
        result: -1,
        message: "success",
        payload: { message: "please check it" },
        logPayload: false,
      };
      return data4createResponseObject;
    }
  },
};
