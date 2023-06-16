const { ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Answer from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { question } = req.params;
    if (!question) {
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
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;

      // // console.log("findQue-->>", findQuestion);
      // let answer = await global.models.GLOBAL.ANSWER.find({
      //   $and: [{ isAbuse: false }, { question: question }],
      // })
      //   .populate({
      //     path: "question",
      //     model: "question",
      //     select: "_id question response filter view displayProfile createdAt",
      //   })
      //   .populate({
      //     path: "createdBy",
      //     model: "user",
      //     select:
      //       "_id name email region currentRole subject profileImage countryOfResidence",
      //   })
      //   .skip(skip)
      //   .limit(limit);

      let answer = await global.models.GLOBAL.ANSWER.aggregate([
        {
          $match: {
            // question: ObjectId(question),
            $and: [{ isAbuse: false }, { question: ObjectId(question) }],
          },
        },
        {
          $group: {
            _id: {
              user: "$createdBy",
              question: "$question",
            },
            answers: {
              $push: "$$ROOT",
            },
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "_id.user",
            foreignField: "_id",
            as: "answerBy",
          },
        },
        {
          $lookup: {
            from: "question",
            localField: "_id.question",
            foreignField: "_id",
            as: "questions",
          },
        },
        {
          $project: {
            answers: 1,
            questions: 1,
            answerBy: {
              _id: 1,
              name: 1,
              email: 1,
              region: 1,
              currentRole: 1,
              subject: 1,
              profileImage: 1,
              countryOfResidence: 1,
            },
          },
        },
      ])
        .skip(skip)
        .limit(limit);
      // // console.log("ANS--->>", answer);
      if (answer) {
        answer = JSON.parse(JSON.stringify(answer));
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.SUCCESS,
          payload: {
            answer,
            count: answer.length,
            page,
            limit,
          },
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
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
