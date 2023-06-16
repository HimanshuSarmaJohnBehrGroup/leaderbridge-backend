const { ObjectId, ObjectID } = require("mongodb");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      let user = await utils.getHeaderFromToken(req.user);
      let findUser = await global.models.GLOBAL.USER.findOne({ _id: user.id });
      let abuseAnswerData = [];
      for (let i = 0; i < findUser?.abuseAnswer.length; i++) {
        abuseAnswerData.push(ObjectId(findUser.abuseAnswer[i].answerId));
      }
      let { roomId, questionId, isGroup, check } = req;

      // let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
      //   _id: roomId,
      // });

      // let TotalResponses = await global.models.GLOBAL.ANSWER.find({
      //   question: questionId,
      //   _id: { $nin: abuseAnswerData },
      // })
      //   // .where("createdBy")
      //   // .ne(ObjectId(user.id))
      //   .count();

      req.page = req.page ? req.page : 1;
      let page = parseInt(req.page);
      req.limit = req.limit ? req.limit : 10;
      let limit = parseInt(req.limit);
      let skip = (parseInt(req.page) - 1) * limit;

      let findAnswer1;
      let findAnswer2;
      let CheckConnection;

      if (roomId && questionId && isGroup) {
        let TotalResponses = await global.models.GLOBAL.ANSWER.find({
          question: questionId,
          // _id: { $nin: abuseAnswerData },
          // isGroup: true,
        })
          // .where("createdBy")
          // .ne(ObjectId(user.id))
          .count();
        let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
          _id: questionId,
        });

        console.log(
          "AAAAAAAAAAAQQQQQQQWEEEEEEEEEEEDD",
          findQuestion?.createdBy
        );

        let ff = check
          ? {
              $or: [
                {
                  requestTo: user.id,
                  requestBy: findQuestion?.createdBy,
                },
                {
                  requestBy: user.id,
                  requestTo: findQuestion?.createdBy,
                },
              ],
            }
          : {};

        let DDD = check
          ? {
              $or: [
                {
                  requestTo: new ObjectID(user.id),
                  requestBy: new ObjectID(findQuestion?.createdBy),
                },
                {
                  requestBy: new ObjectID(user.id),
                  requestTo: new ObjectID(findQuestion?.createdBy),
                },
              ],
            }
          : {};

        let body = { status: 0 };
        if (findQuestion?.createdBy == user.id) {
          body = {};
        }
        let findRoom = await global.models.GLOBAL.ANSWER_GROUP.findOne({
          _id: ObjectId(roomId),
        });

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

        console.log("AAAQQQQWWWEEEE", user.id);

        let updateChat = await global.models.GLOBAL.ANSWER.updateMany(
          { roomId: ObjectId(roomId) },
          { $addToSet: { seenBy: ObjectId(user.id) } }
        );

        if (findRoom) {
          let MyResponse = await global.models.GLOBAL.ANSWER.find({
            createdBy: ObjectId(user.id),
            roomId: ObjectId(roomId),
          }).count();

          // let findAnswer = await global.models.GLOBAL.ANSWER.find({
          //   roomId: ObjectId(roomId),
          //   _id: { $nin: abuseAnswerData },
          //   isGroup: true,
          // }).populate({
          //   path: "createdBy",
          //   model: "user",
          //   select:
          //     "_id name subject profileImage currentRole countryOfResidence",
          // });
          {
            console.log("AAAAAAAAAAASSSSSSSSSDDD", roomId);
          }
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
                            $eq: ["$_id", new ObjectId(user.id)],
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
                      "createdBy._id": new ObjectId(user.id),
                    },
                  },
                ],
                allans: [
                  {
                    $match: {
                      "createdBy._id": {
                        $ne: new ObjectId(user.id),
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
                owner: "$mergedArray.owner",
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

          let findAnswerCount = await global.models.GLOBAL.ANSWER.aggregate([
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
                            $eq: ["$_id", new ObjectId(user.id)],
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
                      "createdBy._id": new ObjectId(user.id),
                    },
                  },
                ],
                allans: [
                  {
                    $match: {
                      "createdBy._id": {
                        $ne: new ObjectId(user.id),
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
                createdAt: 1,
              },
            },

            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ]);

          console.log("findAnswerCount", findAnswerCount);

          if (!findAnswer.length < 0) {
            const data4createResponseObject = {
              req: req,
              result: -1,
              message: messages.GENERAL,
              payload: {},
              logPayload: false,
            };
            return data4createResponseObject;
          } else {
            let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
              _id: findRoom.questionId,
            });

            findAnswer1 = await global.models.GLOBAL.ANSWER.find({
              roomId: roomId,
              createdBy: ObjectId(user.id),
            });
            findAnswer2 = await global.models.GLOBAL.ANSWER.find({
              roomId: roomId,
              // createdBy: ObjectId("636b74617a3ce63a87b81331") ,
              createdBy: ObjectId(findQuestion.createdBy),
            });

            if (findQuestion?.allowConnectionRequest == false) {
              CheckConnection = false;
            } else {
              CheckConnection =
                findAnswer1 &&
                findAnswer1.length > 0 &&
                findAnswer2 &&
                findAnswer2.length > 0
                  ? true
                  : false;
            }

            let findRequest =
              await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findOne({
                roomId: ObjectId(roomId),
                typeOfRequest: "requestProfileAccess",
                requestBy: user.id,
                ...ff,

                // $or: [
                //   {
                //     requestTo: user.id,
                //     requestBy: findQuestion?.createdBy,
                //   },
                //   {
                //     requestBy: user.id,
                //     requestTo: findQuestion?.createdBy,
                //   },
                // ],
              })
                .populate({
                  path: "requestTo",
                  model: "user",
                  select:
                    "_id name email region currentRole subject profileImage countryOfResidence",
                })
                .populate({
                  path: "requestBy",
                  model: "user",
                  select:
                    "_id name email region currentRole subject profileImage countryOfResidence",
                })
                .sort({ _id: -1 });

            let findPrivateRequest =
              await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findOne({
                roomId: ObjectId(roomId),
                typeOfRequest: "privateChatRequest",
                ...ff,
              })
                .populate({
                  path: "requestTo",
                  model: "user",
                  select:
                    "_id name email region currentRole subject profileImage countryOfResidence",
                })
                .populate({
                  path: "requestBy",
                  model: "user",
                  select:
                    "_id name email region currentRole subject profileImage countryOfResidence",
                })
                .sort({ _id: -1 });

            let checkRequest = await global.models.GLOBAL.CONNECTION.findOne({
              senderId: user.id,
              receiverId: findRoom.createdBy,
            });

            let isFriend;
            if (checkRequest) {
              isFriend = "pending";
            } else {
              const checkRequestProfile =
                await global.models.GLOBAL.USER.findOne({
                  _id: user.id,
                  $and: [{ accepted: { $in: findRoom.createdBy } }],
                });

              isFriend = checkRequestProfile == null ? "false" : "true";
            }

            // let CheckRoom = await global.models.GLOBAL.ANSWER_GROUP.find({
            //   _id: ObjectId(roomId),
            //   $and: [
            //     {
            //       lastMessage: { $ne: {} },
            //     },
            //   ],
            // }).count();

            // const SortingAnswer = [...findAnswer].sort(function (a, b) {
            //   return b.createdAt - a.createdAt;
            // });
            const filteredArr = findAnswer.filter(
              (obj) => Object.keys(obj).length !== 0
            ); // filter out empty objects

            const resultArr = filteredArr.length ? filteredArr : [];

            const data4createResponseObject = {
              req: req,
              result: 0,
              message: messages.ITEM_FETCHED,
              payload: {
                answer: resultArr,
                request: findRequest,
                privateRequest: findPrivateRequest,

                isFriend: isFriend,
                CheckConnection: CheckConnection,
                response: TotalResponses,
                Respondents: Respondents[0]?.Respondents
                  ? Respondents[0]?.Respondents
                  : 0,
                answercount: MyResponse,
                total: findAnswerCount[0]?.count
                  ? findAnswerCount[0]?.count
                  : 0,
              },
              logPayload: false,
            };
            return data4createResponseObject;
          }
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
      } else if (roomId && questionId && !isGroup) {
        let TotalResponses = await global.models.GLOBAL.ANSWER.find({
          question: questionId,
          // _id: { $nin: abuseAnswerData },
          // isGroup: false,
        })
          // .where("createdBy")
          // .ne(ObjectId(user.id))
          .count();
        let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
          _id: questionId,
        });

        let body = { status: 0 };
        if (findQuestion?.createdBy == user.id) {
          body = {};
        }
        let findRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
          _id: ObjectId(roomId),
        });

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

        console.log("QQQQQQQQQQQQQWEEEEEEEE", user.id);
        let updateChat = await global.models.GLOBAL.ANSWER.updateMany(
          { roomId: ObjectId(roomId) },
          { $addToSet: { seenBy: ObjectId(user.id) } }
        );

        if (findRoom) {
          let MyResponse = await global.models.GLOBAL.ANSWER.find({
            createdBy: ObjectId(user.id),
            roomId: ObjectId(roomId),
          }).count();

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
                            $eq: ["$_id", new ObjectId(user.id)],
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
                      "createdBy._id": new ObjectId(user.id),
                    },
                  },
                ],
                allans: [
                  {
                    $match: {
                      "createdBy._id": {
                        $ne: new ObjectId(user.id),
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
                owner: "$mergedArray.owner",
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

          let findAnswerCount = await global.models.GLOBAL.ANSWER.aggregate([
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
                            $eq: ["$_id", new ObjectId(user.id)],
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
                      "createdBy._id": new ObjectId(user.id),
                    },
                  },
                ],
                allans: [
                  {
                    $match: {
                      "createdBy._id": {
                        $ne: new ObjectId(user.id),
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
                createdAt: 1,
              },
            },

            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ]);

          if (!findAnswer.length < 0) {
            const data4createResponseObject = {
              req: req,
              result: -1,
              message: messages.GENERAL,
              payload: {},
              logPayload: false,
            };
            return data4createResponseObject;
          } else {
            let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
              _id: findRoom.questionId,
            });

            findAnswer1 = await global.models.GLOBAL.ANSWER.find({
              roomId: roomId,
              createdBy: ObjectId(user.id),
            });
            findAnswer2 = await global.models.GLOBAL.ANSWER.find({
              roomId: roomId,
              // createdBy: ObjectId("636b74617a3ce63a87b81331") ,
              createdBy: ObjectId(findQuestion?.createdBy),
            });

            if (findQuestion?.allowConnectionRequest == false) {
              CheckConnection = false;
            } else {
              CheckConnection =
                findAnswer1 &&
                findAnswer1.length > 0 &&
                findAnswer2 &&
                findAnswer2.length > 0
                  ? true
                  : false;
            }

            let findRequest =
              await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
                roomId: ObjectId(roomId),
                typeOfRequest: "requestProfileAccess",
              })
                .populate({
                  path: "requestTo",
                  model: "user",
                  select:
                    "_id name email region currentRole subject profileImage countryOfResidence",
                })
                .populate({
                  path: "requestBy",
                  model: "user",
                  select:
                    "_id name email region currentRole subject profileImage countryOfResidence",
                })
                .sort({ _id: -1 });

            // let findPrivateRequest =
            //   await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findOne({
            //     roomId: ObjectId(roomId),
            //     typeOfRequest: "privateChatRequest",
            //   })
            //     .populate({
            //       path: "requestTo",
            //       model: "user",
            //       select:
            //         "_id name email region currentRole subject profileImage countryOfResidence",
            //     })
            //     .populate({
            //       path: "requestBy",
            //       model: "user",
            //       select:
            //         "_id name email region currentRole subject profileImage countryOfResidence",
            //     })
            //     .sort({ _id: -1 });

            let checkRequest = await global.models.GLOBAL.CONNECTION.findOne({
              senderId: user.id,
              receiverId: findRoom.createdBy,
            });
            let isFriend;
            if (checkRequest) {
              isFriend = "pending";
            } else {
              const checkRequestProfile =
                await global.models.GLOBAL.USER.findOne({
                  _id: user.id,
                  $and: [{ accepted: { $in: findRoom.createdBy } }],
                });

              isFriend = checkRequestProfile == null ? "false" : "true";
            }

            // Room Logic

            // const SortingAnswer = [...findAnswer, ...GetAllAnswer].sort(
            //   function (a, b) {
            //     return b.createdAt - a.createdAt;
            //   }
            // );

            const filteredArr = findAnswer.filter(
              (obj) => Object.keys(obj).length !== 0
            ); // filter out empty objects

            const resultArr = filteredArr.length ? filteredArr : [];
            const data4createResponseObject = {
              req: req,
              result: 0,
              message: messages.ITEM_FETCHED,
              payload: {
                answer: resultArr,
                request: findRequest,
                privateRequest: [],
                isFriend: isFriend,
                data: "Meet",
                CheckConnection: CheckConnection,
                Respondents: Respondents[0]?.Respondents
                  ? Respondents[0]?.Respondents
                  : 0,

                total: findAnswerCount[0]?.count
                  ? findAnswerCount[0]?.count
                  : 0,
                response: findQuestion?.response,
                answercount: MyResponse,
              },
              logPayload: false,
            };
            return data4createResponseObject;
          }
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
