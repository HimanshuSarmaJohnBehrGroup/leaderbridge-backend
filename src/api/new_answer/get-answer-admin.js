const { ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      let { user } = req;
      //   let user = await utils.getHeaderFromToken(req.user);
      let { questionId } = req.params;
      let { roomId, isGroup } = req.body;

      console.log("questionId---->", questionId);
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: ObjectId(questionId),
      });
      if (findQuestion) {
        let TotalResponses = await global.models.GLOBAL.ANSWER.find({
          question: questionId,
          isGroup: isGroup,
        }).count();

        let findAnswer = await global.models.GLOBAL.ANSWER.find({
          question: questionId,
          roomId: ObjectId(roomId),
        })
          .populate({
            path: "createdBy",
            model: "user",
            select:
              "_id name subject profileImage currentRole countryOfResidence",
          })
          .sort({
            createdAt: -1,
          });

        // const isFriend = await global.models.GLOBAL.USER.findOne({
        //   _id: user.id,
        //   accepted: findRoom.createdBy,
        // });

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_FETCHED,
          payload: {
            TotalResponses: TotalResponses,
            answer: findAnswer,
          },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.ITEM_NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        return res
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
