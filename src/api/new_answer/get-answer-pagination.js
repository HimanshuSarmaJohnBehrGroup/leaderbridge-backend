const { ObjectId, ObjectID } = require("mongodb");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const enums = require("../../../json/enums.json");

module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      const { user } = req;
      let findUser = await global.models.GLOBAL.USER.findOne({ _id: user._id });
      let abuseAnswerData = [];
      for (let i = 0; i < findUser.abuseAnswer.length; i++) {
        abuseAnswerData.push(ObjectId(findUser.abuseAnswer[i].answerId));
      }
      let { roomId, questionId, isGroup, check } = req.body;

      console.log("DDDDDDDDDDDDDDDDDDD", req.body);
      // let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
      //   _id: roomId,
      // });

      // let TotalResponses = await global.models.GLOBAL.ANSWER.find({
      //   question: questionId,
      //   _id: { $nin: abuseAnswerData },
      // })
      //   // .where("createdBy")
      //   // .ne(ObjectId(user._id))
      //   .count();

      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 5;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;

      let findAnswer1;
      let findAnswer2;
      let CheckConnection;

      if (roomId && questionId && isGroup) {
        let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
          _id: questionId,
        });

        let ff = check
          ? {
              $or: [
                {
                  requestTo: user._id,
                  requestBy: findQuestion?.createdBy,
                },
                {
                  requestBy: user._id,
                  requestTo: findQuestion?.createdBy,
                },
              ],
            }
          : {};

        let DDD = check
          ? {
              $or: [
                {
                  requestTo: new ObjectID(user._id),
                  requestBy: new ObjectID(findQuestion?.createdBy),
                },
                {
                  requestBy: new ObjectID(user._id),
                  requestTo: new ObjectID(findQuestion?.createdBy),
                },
              ],
            }
          : {};

        console.log("AAAAAQQQQQQQQQQQQQQQQEWWWWWWW", check);

        let body = { status: 0 };
        if (findQuestion.createdBy == user._id) {
          body = {};
        }
        let findRoom = await global.models.GLOBAL.ANSWER_GROUP.findOne({
          _id: ObjectId(roomId),
        });

        if (findRoom) {
          let findAnswer = await global.models.GLOBAL.ANSWER.aggregate([
            {
              $match: {
                roomId: new ObjectId(roomId),
                isGroup: isGroup,
              },
            },
            {
              $lookup: {
                from: "user",
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ["$_id", new ObjectId(user._id)],
                          },
                        ],
                      },
                    },
                  },
                ],
                as: "abuseAnswerUser",
              },
            },
            {
              $unwind: {
                path: "$abuseAnswerUser",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $addFields: {
                abuseAnswer: "$abuseAnswerUser.abuseAnswer.answerId",
              },
            },
            {
              $match: {
                $expr: {
                  $not: {
                    $in: ["$_id", "$abuseAnswer"],
                  },
                },
              },
            },
            {
              $lookup: {
                from: "user",
                let: {
                  createdBy: "$createdBy",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$_id", "$$createdBy"],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      subject: 1,
                      profileImage: 1,
                      currentRole: 1,
                      countryOfResidence: 1,
                    },
                  },
                ],
                as: "createdBy",
              },
            },
            {
              $unwind: {
                path: "$createdBy",
              },
            },
            {
              $project: {
                "createdBy.password": 0,
              },
            },
            {
              $facet: {
                myans: [
                  {
                    $match: {
                      "createdBy._id": new ObjectId(user._id),
                    },
                  },
                ],
                allans: [
                  {
                    $match: {
                      "createdBy._id": {
                        $ne: new ObjectId(user._id),
                      },
                    },
                  },
                ],
              },
            },
            {
              $project: {
                all: {
                  $setUnion: ["$myans", "$allans"],
                },
              },
            },
            {
              $lookup: {
                from: "requestProfile",
                pipeline: [
                  {
                    $match: {
                      typeOfRequest: "requestProfileAccess",
                      ...DDD,
                      $expr: {
                        $eq: ["$roomId", new ObjectId(roomId)],
                      },
                    },
                  },
                ],
                as: "requestProfileAccess",
              },
            },
            {
              $lookup: {
                from: "requestProfile",
                pipeline: [
                  {
                    $match: {
                      ...DDD,
                      typeOfRequest: "privateChatRequest",
                      $expr: {
                        $eq: ["$roomId", new ObjectId(roomId)],
                      },
                    },
                  },
                ],
                as: "privateChatRequest",
              },
            },
            {
              $project: {
                mergedArray: {
                  $concatArrays: [
                    "$all",
                    "$requestProfileAccess",
                    "$privateChatRequest",
                  ],
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
                localField: "mergedArray.requestTo",
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
                as: "mergedArray.requestTo",
              },
            },
            {
              $unwind: {
                path: "$mergedArray.requestTo",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "user",
                localField: "mergedArray.requestBy",
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
                as: "mergedArray.requestBy",
              },
            },
            {
              $unwind: {
                path: "$mergedArray.requestBy",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: "$mergedArray._id",
                isUpdated: "$mergedArray.isUpdated",
                isAbuse: "$mergedArray.isAbuse",
                isStar: "$mergedArray.isStar",
                roomId: "$mergedArray.roomId",
                answer: "$mergedArray.answer",
                displayProfile: "$all.displayProfile",
                tag: "$mergedArray.tag",
                type: "$mergedArrayl.type",
                createdBy: "$mergedArray.createdBy",
                question: "$mergedArray.question",
                createdAt: "$mergedArray.createdAt",
                __v: "$mergedArray.__v",
                status: "$mergedArray.status",
                updatedAt: "$mergedArray.updatedAt",
                typeOfRequest: "$mergedArray.typeOfRequest",
                requestBy: "$mergedArray.requestBy",
                requestTo: "$mergedArray.requestTo",
                acceptedAT: "$mergedArray.acceptedAT",
                acceptedBy: "$mergedArray.acceptedBy",
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },

            {
              $skip: skip,
            },

            {
              $limit: limit,
            },
          ]);

          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: {
              answer: findAnswer,
            },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
          return data4createResponseObject;
        } else {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.ITEM_NOT_FOUND,
            payload: {},
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else if (roomId && questionId && !isGroup) {
        let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
          _id: questionId,
        });

        let body = { status: 0 };
        if (findQuestion.createdBy == user._id) {
          body = {};
        }
        let findRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
          _id: ObjectId(roomId),
        });

        // let CheckUserFound2 = TotalRespondent
        //   ? TotalRespondent?.participateIds?.map((x) => x._id)
        //   : [];

        if (findRoom) {
          let findAnswer = await global.models.GLOBAL.ANSWER.aggregate([
            {
              $match: {
                roomId: new ObjectId(roomId),
                isGroup: isGroup,
              },
            },
            {
              $lookup: {
                from: "user",
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ["$_id", new ObjectId(user._id)],
                          },
                        ],
                      },
                    },
                  },
                ],
                as: "abuseAnswerUser",
              },
            },
            {
              $unwind: {
                path: "$abuseAnswerUser",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $addFields: {
                abuseAnswer: "$abuseAnswerUser.abuseAnswer.answerId",
              },
            },
            {
              $match: {
                $expr: {
                  $not: {
                    $in: ["$_id", "$abuseAnswer"],
                  },
                },
              },
            },
            {
              $lookup: {
                from: "user",
                let: {
                  createdBy: "$createdBy",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$_id", "$$createdBy"],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      subject: 1,
                      profileImage: 1,
                      currentRole: 1,
                      countryOfResidence: 1,
                    },
                  },
                ],
                as: "createdBy",
              },
            },
            {
              $unwind: {
                path: "$createdBy",
              },
            },
            {
              $project: {
                "createdBy.password": 0,
              },
            },
            {
              $facet: {
                myans: [
                  {
                    $match: {
                      "createdBy._id": new ObjectId(user._id),
                    },
                  },
                ],
                allans: [
                  {
                    $match: {
                      "createdBy._id": {
                        $ne: new ObjectId(user._id),
                      },
                    },
                  },
                ],
              },
            },
            {
              $project: {
                all: {
                  $setUnion: ["$myans", "$allans"],
                },
              },
            },
            {
              $lookup: {
                from: "requestProfile",
                pipeline: [
                  {
                    $match: {
                      typeOfRequest: "requestProfileAccess",

                      $expr: {
                        $eq: ["$roomId", new ObjectId(roomId)],
                      },
                    },
                  },
                ],
                as: "requestProfileAccess",
              },
            },
            {
              $lookup: {
                from: "requestProfile",
                pipeline: [
                  {
                    $match: {
                      typeOfRequest: "privateChatRequest",
                      $expr: {
                        $eq: ["$roomId", new ObjectId(roomId)],
                      },
                    },
                  },
                ],
                as: "privateChatRequest",
              },
            },
            {
              $project: {
                mergedArray: {
                  $concatArrays: [
                    "$all",
                    "$requestProfileAccess",
                    "$privateChatRequest",
                  ],
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
                localField: "mergedArray.requestTo",
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
                as: "mergedArray.requestTo",
              },
            },
            {
              $unwind: {
                path: "$mergedArray.requestTo",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "user",
                localField: "mergedArray.requestBy",
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
                as: "mergedArray.requestBy",
              },
            },
            {
              $unwind: {
                path: "$mergedArray.requestBy",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: "$mergedArray._id",
                isUpdated: "$mergedArray.isUpdated",
                isAbuse: "$mergedArray.isAbuse",
                isStar: "$mergedArray.isStar",
                roomId: "$mergedArray.roomId",
                answer: "$mergedArray.answer",
                displayProfile: "$all.displayProfile",
                tag: "$mergedArray.tag",
                type: "$mergedArrayl.type",
                createdBy: "$mergedArray.createdBy",
                question: "$mergedArray.question",
                createdAt: "$mergedArray.createdAt",
                __v: "$mergedArray.__v",
                status: "$mergedArray.status",
                updatedAt: "$mergedArray.updatedAt",
                typeOfRequest: "$mergedArray.typeOfRequest",
                requestBy: "$mergedArray.requestBy",
                requestTo: "$mergedArray.requestTo",
                acceptedAT: "$mergedArray.acceptedAT",
                acceptedBy: "$mergedArray.acceptedBy",
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },

            {
              $skip: skip,
            },

            {
              $limit: limit,
            },
          ]);

          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: {
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
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
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
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
