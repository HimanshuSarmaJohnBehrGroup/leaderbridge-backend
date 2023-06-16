const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const ObjectId = require("mongodb").ObjectId;
const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  handler: async (req, res) => {
    try {
      const findQuestion = await global.models.GLOBAL.QUESTION.find({}).select(
        "_id"
      );

      for (let i = 0; i < findQuestion.length; i++) {
        const element = findQuestion[i]?._id;
        // const GetGroup = await global.models.GLOBAL.ANSWER_GROUP.findOne({
        //   questionId: ObjectId(element),
        // }).select("participateIds");

        // const GetAnswerGrop = await global.models.GLOBAL.ANSWER_ROOM.find({
        //   questionId: ObjectId(element),
        // }).select("participateIds");

        // const participateIds = await GetAnswerGrop.map(
        //   (obj) => obj.participateIds
        // ).flat();

        // console.log("SSSSSSSSSSSSSSSSSSSSSSS", GetGroup?.participateIds);
        // const DataAAAA = (await GetGroup?.participateIds)
        //   ? GetGroup?.participateIds.map((obj) => ObjectId(obj?._id))
        //   : [];

        // console.log("DataAAAA", DataAAAA, participateIds);
        // const Data = [...DataAAAA, ...participateIds];

        // let uniqueArr = [...new Set(Data.map((obj) => obj.toString()))].map(
        //   (id) => ObjectId(id)
        // );

        // let filteredArr = uniqueArr.filter((id) => !id.equals(element));

        // const Respondents = await global.models.GLOBAL.ANSWER.aggregate([
        //   {
        //     $match: {
        //       // roomId: ObjectId(GetGroup?._id),
        //       question: ObjectId(element),
        //       createdBy: {
        //         $in: filteredArr,
        //       },
        //       // _id: { $nin: abuseAnswerData },
        //     },
        //   },

        //   {
        //     $group: {
        //       _id: "$createdBy",
        //       count: {
        //         $sum: 1,
        //       },
        //     },
        //   },

        //   {
        //     $count: "Respondents",
        //   },
        // ]);

        // console.log("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", Respondents);

        let TotalResponses = await global.models.GLOBAL.ANSWER.find({
          question: ObjectId(element),
          // _id: { $nin: abuseAnswerData },
          // isGroup: true,
        }).count();

        const updateQuestion =
          await global.models.GLOBAL.QUESTION.findOneAndUpdate(
            {
              _id: ObjectId(element),
            },
            {
              $set: {
                response: TotalResponses,
              },
            }
          );
      }

      const data4createResponseObject = {
        req: req,
        result: -1,
        message: "D",
        payload: { gggg: Respondents[0]?.Respondents },
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
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
