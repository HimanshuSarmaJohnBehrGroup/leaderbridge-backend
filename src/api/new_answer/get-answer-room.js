const { ObjectId } = require("mongodb");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      // let { user } = req;

      let user = await utils.getHeaderFromToken(req.user);
      let { question } = req;
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: ObjectId(question),
      });
      // // console.log("QUE-->>", findQuestion);
      if (findQuestion) {
        const id = question;
        const answerBy = user.id;
        const questionBy = findQuestion.createdBy;

        let participateIds = [];
        participateIds.push(answerBy);
        participateIds.push(id);
        participateIds.push(questionBy);

        let findAnswerRoom = await global.models.GLOBAL.ANSWER_ROOM.find({
          privacy: "private",
          questionId: ObjectId(findQuestion._id),
          // $and: [
          //   {
          //     lastMessage: { $exists: true },
          //   },
          // ],
        }).populate({
          path: "createdBy",
          model: "user",
          select:
            "_id name subject profileImage currentRole email blockUser region",
        });

        let findAnswerRoom2 = await global.models.GLOBAL.ANSWER_GROUP.find({
          questionId: ObjectId(findQuestion._id),
        })
          .populate({
            path: "createdBy",
            model: "user",
            select:
              "_id name subject profileImage currentRole email blockUser region displayProfile",
          })
          .populate({
            path: "participateIds._id",
            model: "user",
            select:
              "_id name subject profileImage currentRole email blockUser region displayProfile",
          });

        // const RespondentsGroup = await global.models.GLOBAL.ANSWER.aggregate([
        //   {
        //     $match: {
        //       roomId: ObjectId(CheckUserFound?._id),
        //       createdBy: {
        //         $in: CheckUserFound2,
        //       },
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

        // for (let i = 0; i < findAnswerRoom.length; i++) {
        //   let answerById = await global.models.GLOBAL.ANSWER.find({
        //     roomId: findAnswerRoom[i]._id,
        //   }).sort({ createdAt: -1 });
        //   // // console.log("answerById---->", answerById);
        // }
        let ThatFindAnswerRoom = [...findAnswerRoom2, ...findAnswerRoom];

        const AddField = await Promise.all(
          ThatFindAnswerRoom.map(async (item, i) => {
            let unseenMessageCount = 0;

            let chat = await global.models.GLOBAL.ANSWER.find({
              roomId: item._id,

              $and: [
                {
                  createdBy: { $ne: ObjectId(user.id) },
                },

                {
                  seenBy: { $nin: [ObjectId(user.id)] },
                },
              ],
            })
              .lean()
              .exec();

            chat.map((AAAAAAAAAA) => {
              unseenMessageCount++;
            });

            return {
              ...item._doc,
              unseenMessageCount: unseenMessageCount,
            };
          })
        );

        const NewChanges = await Promise.all(
          AddField.map(async (item, i) => {
            if (item?.isGroup) {
              {
                console.log(
                  "itemitemitemitemitem",
                  item._id,
                  item.participateIds
                );
              }
              const RespondentsGroup =
                await global.models.GLOBAL.ANSWER.aggregate([
                  {
                    $match: {
                      roomId: ObjectId(item?._id),
                      createdBy: {
                        $in: item.participateIds
                          .filter((x) => x?._id?._id != user?.id)
                          .map((x) => x?._id?._id),
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
              return {
                ...item,
                Respondents: RespondentsGroup[0]?.Respondents
                  ? RespondentsGroup[0]?.Respondents
                  : 0,
              };
            } else {
              return {
                ...item,
                Respondents: 0,
              };
            }
          })
        );

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_FETCHED,
          payload: {
            room: NewChanges,
          },
          logPayload: false,
        };
        return data4createResponseObject;
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
