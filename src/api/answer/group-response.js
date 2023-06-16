const { ObjectId, ObjectID } = require("mongodb");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  //  route validation

  handler: async (req, res) => {
    let { user, questionId } = req;
    let abuseAnswerData = [];
    const userData = await utils.getHeaderFromToken(user);

    try {
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: questionId,
      });

      if (!findQuestion) {
        const data4createResponseObject = {
          req: req,
          result: 1,
          message: "Question not found",
          payload: {},
          logPayload: false,
        };
        return data4createResponseObject;
      }
      let TotalResponses = await global.models.GLOBAL.ANSWER.find({
        question: questionId,
        // _id: { $nin: abuseAnswerData },
      })
        // .where("createdBy")
        // .ne(ObjectId(user.id))
        .count();

      const GetGroup = await global.models.GLOBAL.ANSWER_GROUP.findOne({
        questionId: ObjectId(questionId),
      }).select("participateIds");

      const GetAnswerGrop = await global.models.GLOBAL.ANSWER_ROOM.find({
        questionId: ObjectId(questionId),
      }).select("participateIds");

      const participateIds = await GetAnswerGrop.map(
        (obj) => obj.participateIds
      ).flat();

      console.log("SSSSSSSSSSSSSSSSSSSSSSS", GetGroup?.participateIds);
      const DataAAAA = (await GetGroup?.participateIds)
        ? GetGroup?.participateIds.map((obj) => ObjectId(obj?._id))
        : [];

      console.log("DataAAAA", DataAAAA, participateIds);
      const Data = [...DataAAAA, ...participateIds];

      let uniqueArr = [...new Set(Data.map((obj) => obj.toString()))].map(
        (id) => ObjectId(id)
      );

      let filteredArr = uniqueArr.filter((id) => !id.equals(questionId));

      const Respondents = await global.models.GLOBAL.ANSWER.aggregate([
        {
          $match: {
            // roomId: ObjectId(GetGroup?._id),
            question: ObjectId(questionId),
            createdBy: {
              $in: filteredArr,
            },
            // _id: { $nin: abuseAnswerData },
          },
        },

        {
          $group: {
            _id: "$createdBy",
            count: {
              $sum: 1,
            },
          },
        },

        {
          $count: "Respondents",
        },
      ]);

      const data4createResponseObject = {
        req: req,
        result: 1,
        message: messages.error,
        payload: {
          GroupResponse: TotalResponses,
          Respondents: Respondents[0]?.Respondents
            ? Respondents[0]?.Respondents
            : 0,
        },
        logPayload: false,
      };
      return data4createResponseObject;
    } catch (error) {
      logger.error(error);
      const data4createResponseObject = {
        req: req,
        result: 1,
        message: messages.error,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
    }
  },
};
