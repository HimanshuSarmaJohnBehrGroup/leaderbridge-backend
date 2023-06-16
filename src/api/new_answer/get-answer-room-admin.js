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

      console.log("questionId---->", questionId);
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: ObjectId(questionId),
      });
      if (findQuestion) {
        const findAnswerRoom = await global.models.GLOBAL.ANSWER_ROOM.aggregate(
          [
            {
              $lookup: {
                from: "answer_group",
                pipeline: [
                  {
                    $match: {
                      questionId: new ObjectId(questionId),
                    },
                  },
                ],
                as: "answer_group",
              },
            },
            {
              $lookup: {
                from: "answer_room",
                pipeline: [
                  {
                    $match: {
                      privacy: "private",
                      questionId: new ObjectId(questionId),
                      $expr: {
                        $eq: [{ $size: "$participateIds" }, 3], // replace 3 with your desired size
                      },
                    },
                  },
                ],
                as: "answer_room",
              },
            },

            {
              $project: {
                mergedArray: {
                  $concatArrays: ["$answer_room", "$answer_group"],
                },
              },
            },
            {
              $unwind: {
                path: "$mergedArray",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "user",
                localField: "mergedArray.createdBy",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
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
                ],
                as: "mergedArray.createdBy",
              },
            },

            {
              $unwind: {
                path: "$mergedArray.createdBy",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$mergedArray.participateIds",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "user",
                // localField: "mergedArray.participateIds._id",
                let: {
                  participateIds: "$mergedArray.participateIds",
                  group: "$isGroup",
                },
                // foreignField: "_id",
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $or: [
                          { $eq: ["$_id", "$$participateIds._id"] },
                          { $eq: ["$_id", "$$participateIds"] },
                        ],
                      },
                    },
                  },
                  {
                    $project: {
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
                ],
                as: "mergedArray.participateIds._id",
              },
            },
            {
              $unwind: {
                path: "$mergedArray.participateIds._id",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $group: {
                _id: "$mergedArray._id",
                participateIds: {
                  $addToSet: "$mergedArray.participateIds",
                },
                isGroup: {
                  $first: "$mergedArray.isGroup",
                },
                isActive: {
                  $first: "$mergedArray.isActive",
                },
                questionId: {
                  $first: "$mergedArray.questionId",
                },
                createdAt: {
                  $first: "$mergedArray.createdAt",
                },
                createdBy: {
                  $first: "$mergedArray.createdBy",
                },
                lastMessage: {
                  $first: "$mergedArray.lastMessage",
                },
              },
            },
          ]
        );

        // const isFriend = await global.models.GLOBAL.USER.findOne({
        //   _id: user.id,
        //   accepted: findRoom.createdBy,
        // });

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_FETCHED,
          payload: {
            room: findAnswerRoom,
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
