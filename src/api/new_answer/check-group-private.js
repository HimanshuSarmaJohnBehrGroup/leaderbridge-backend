const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const mongoose = require("mongoose");
const logger = require("../../logger");
const utils = require("../../utils");
const { ObjectID } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  //  route validation
  validation: Joi.object({
    questionId: Joi.string().required(),
  }),
  // route handler
  handler: async (req, res) => {
    try {
      const { questionId } = req;
      let CheckUserFound2 = [];
      const user = await utils.getHeaderFromToken(req.user);
      // console.log("this calleddddddd");

      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: questionId,
      });
      if (findQuestion) {
        let GroupAndPrivate = [];

        let participateIds = [];
        // check user type

        // if (isGroup) {
        const findGroup = await global.models.GLOBAL.ANSWER_GROUP.findOne({
          questionId: questionId,
        });

        participateIds.push(user.id);
        participateIds.push(questionId);
        participateIds.push(findQuestion.createdBy);

        let chatRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
          privacy: "private",
          participateIds: {
            $size: participateIds.length,
            $all: [...participateIds],
          },
        });

        if (chatRoom) {
          GroupAndPrivate.push(chatRoom);
          // Private = chatRoom;
        }

        if (findGroup) {
          const CheckUserFound =
            await global.models.GLOBAL.ANSWER_GROUP.findOne({
              questionId: questionId,
            });
          // .where("participateIds._id")
          // .equals(ObjectId(user.id));

          console.log("HHHHHHHHHHHHHH", CheckUserFound);

          CheckUserFound2 = CheckUserFound.participateIds.map((x) => x._id);

          // const checkID = await global.models.GLOBAL.ANSWER.find({
          //   roomId: CheckUserFound?._id,
          // })
          //   .where("createdBy")
          //   .in(ObjectId(CheckUserFound.participateIds.map((x) => x._id)));

          // const FindAnswer = await global.models.GLOBAL.ANSWER.findOne({
          //   roomId: ObjectId(CheckUserFound?._id),
          // })
          //   .where("createdBy._id")
          //   .equals(ObjectId(user.id));

          const RespondentsGroup = await global.models.GLOBAL.ANSWER.aggregate([
            {
              $match: {
                roomId: ObjectId(CheckUserFound?._id),
                createdBy: {
                  $in: CheckUserFound2,
                },
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

          if (CheckUserFound) {
            const MeregeGroup = {
              createdAt: CheckUserFound.createdAt,
              createdBy: CheckUserFound.createdBy,
              isGroup: CheckUserFound.isGroup,
              lastMessage: CheckUserFound.lastMessage,
              participateIds: CheckUserFound.participateIds,
              privacy: CheckUserFound.privacy,
              questionId: CheckUserFound.questionId,
              Respondents: RespondentsGroup[0]?.Respondents
                ? RespondentsGroup[0]?.Respondents
                : 0,
              _id: CheckUserFound._id,
            };
            GroupAndPrivate.push(MeregeGroup);
            // Group = CheckUserFound;
          }
        }

        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.GENERAL,
          payload: { GroupAndPrivate },
          logPayload: false,
        };

        return data4createResponseObject;
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
      return data4createResponseObject;
    }
  },
};
