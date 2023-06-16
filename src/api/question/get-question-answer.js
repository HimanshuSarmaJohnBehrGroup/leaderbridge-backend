const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const ObjectId = require("mongodb").ObjectId;

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");

// Retrieve and return all Question from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { question } = req.params;

    let criteria = {};

    if (question) {
      criteria = {
        _id: ObjectId(question),
      };
    }

    // try {
    if (question) {
      let quResult = await global.models.GLOBAL.QUESTION.findOne({
        ...criteria,
        status: "active",
      })
        .populate({
          path: "createdBy",
          model: "user",
          select: "_id name subject profileImage currentRole",
        })
        .exec();

      if (quResult) {
        let GroupValue = quResult.group == "Everyone" ? true : false;
        let participateIds = [];
        // check user type
        participateIds.push(user._id);
        participateIds.push(quResult._id);
        participateIds.push(quResult.createdBy._id);

        const GetStaredMessage = await global.models.GLOBAL.ANSWER.find({
          question: ObjectId(quResult._id),
          isStar: true,
          isGroup: GroupValue,
        }).count();

        console.log("QQWWWEDDSDASDFFFGGGGGGGGGGG", GetStaredMessage);

        if (GroupValue == true) {
          console.log(GroupValue, "firstGroup");
          const findGroup = await global.models.GLOBAL.ANSWER_GROUP.findOne({
            questionId: quResult._id,
          });

          const FindGroupGetID = findGroup?.participateIds?.map((item) => {
            return item._id;
          });

          console.log("AAAAAAAAAAAAAAAAASSSSSSSSDDDDDDDDDDDDD", FindGroupGetID);

          const Respondents = await global.models.GLOBAL.ANSWER.aggregate([
            {
              $match: {
                roomId: ObjectId(findGroup?._id),
                question: ObjectId(quResult?._id),
                createdBy: {
                  $in: FindGroupGetID,
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

          let TotalResponses = await global.models.GLOBAL.ANSWER.find({
            roomId: ObjectId(findGroup?._id),
          }).count();

          if (findGroup) {
            const data4createResponseObject = {
              req: req,
              result: 0,
              message: messages.INITIATION_SUCCESS,
              payload: {
                chatRoom: findGroup,
                questions: quResult,
                Respondents: Respondents[0]?.Respondents
                  ? Respondents[0]?.Respondents
                  : 0,
                TotalResponses: TotalResponses,
                stared: GetStaredMessage,
              },
              logPayload: false,
            };
            return res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
            // }
          }
        } else if (GroupValue == false) {
          let chatRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
            privacy: "private",
            participateIds: {
              $size: participateIds.length,
              $all: [...participateIds],
            },
          });
          if (chatRoom) {
            const data4createResponseObject = {
              req: req,
              result: 0,
              message: messages.INITIATION_SUCCESS,
              payload: {
                chatRoom: chatRoom,
                questions: quResult,
                Respondents: quResult.room,
                TotalResponses: quResult.response,
                stared: GetStaredMessage,
              },
              logPayload: false,
            };
            return res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          } else {
            let roomObj = {
              participateIds: participateIds,
              questionId: quResult._id,
              createdAt: Date.now(),
              privacy: quResult?.group == "Author" ? "private" : "public",
              createdBy: user._id,
            };

            // const updatedQue = await global.models.GLOBAL.QUESTION.updateOne(
            //   { _id: questionId, createdBy: { $nin: user.id } },
            //   { $inc: { room: 1 } },
            //   { new: true }
            // );

            const GetAnswerRoom = await global.models.GLOBAL.ANSWER_ROOM.create(
              roomObj
            );

            // chatRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
            //   privacy: "private",
            //   participateIds: {
            //     $size: participateIds.length,
            //     $all: [...participateIds],
            //   },
            // });

            const data4createResponseObject = {
              req: req,
              result: 0,
              message: messages.INITIATION_SUCCESS,
              payload: {
                chatRoom: GetAnswerRoom,
                questions: quResult,
                Respondents: quResult.room,
                TotalResponses: quResult.response,
                stared: GetStaredMessage,
              },

              logPayload: false,
            };
            return res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          }
        }
      } else {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: "item not found",
          payload: {
            questions: quResult,
          },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.NOT_ACCEPTABLE)
          .json(utils.createResponseObject(data4createResponseObject));
      }

      // const data4createResponseObject = {
      //   req: req,
      //   result: 0,
      //   message: messages.ITEM_FETCHED,
      //   payload: {
      //     questions: quResult,
      //   },
      //   logPayload: false,
      // };
      // res
      //   .status(enums.HTTP_CODES.OK)
      //   .json(utils.createResponseObject(data4createResponseObject));
    }

    // today's Questions Count
    // } catch (error) {
    //   logger.error(
    //     `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
    //   );
    //   const data4createResponseObject = {
    //     req: req,
    //     result: -1,
    //     message: messages.GENERAL,
    //     payload: {},
    //     logPayload: false,
    //   };
    //   res
    //     .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
    //     .json(utils.createResponseObject(data4createResponseObject));
    // }
  },
};
