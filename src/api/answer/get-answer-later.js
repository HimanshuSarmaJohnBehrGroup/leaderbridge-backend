const { ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Answer from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { search } = req.query;
    let Question = [];
    try {
      let abuseQuestion = [];
      for (var i = 0; i < user.abuseQuestion.length; i++) {
        abuseQuestion.push(user.abuseQuestion[i].questionId);
      }
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;

      // var question = await global.models.GLOBAL.USER.find({
      //   _id: user._id,
      // })
      //   .populate({
      //     path: "answerLater",
      //     model: "question",
      //     select:
      //       "_id question response filter status view displayProfile allowConnectionRequest dropdown experience createdAt createdBy",
      //     populate: {
      //       path: "createdBy",
      //       model: "user",
      //     },
      //   })
      //   .skip(skip)
      //   .limit(limit);

      let question = await global.models.GLOBAL.QUESTION.aggregate([
        // {
        //   $match: {
        //     _id: new ObjectId("63ee09bbdaaad81f94aa229e"),
        //   },
        // },

        {
          $match: {
            share: false,
            $and: [
              // { createdBy: { $nin: FindCompanyId } },
              { createdBy: { $ne: null } },
              { _id: { $in: user.answerLater } },
              { _id: { $nin: user.removeQuestion } },
              { _id: { $nin: abuseQuestion } },
              // { _id: { $nin: questionArray } },
              { createdBy: { $nin: user.blockUser } },
              { createdBy: { $nin: [user._id] } },
              {
                createdAt: {
                  $gte: user.createdAt,
                },
              },
            ],
            // $or: [
            //   { "filter.options.optionName": { $exists: false } },
            //   { "filter.options.optionName": { $in: user.subject } },
            // ],
            createdBy: { $nin: user.blockUser },
            createdBy: { $nin: [user._id] },
            reportAbuse: false,
            status: "active",
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdBy",
          },
        },
        {
          $unwind: {
            path: "$createdBy",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            question: 1,
            createdAt: 1,
            updatedAt: 1,
            new: 1,
            createdBy: {
              _id: "$createdBy._id",
              name: "$createdBy.name",
              subject: "$createdBy.subject",
              profileImage: "$createdBy.profileImage",
              currentRole: "$createdBy.currentRole",
            },
            displayProfile: 1,
            allowConnectionRequest: 1,
            view: 1,
            response: 1,
            status: 1,
            reportAbuse: 1,
            share: 1,
            experience: 1,
            dropdown: 1,
            group: 1,
            room: 1,
            filter: 1,
            new: 1,
            reach: 1,
          },
        },
        {
          $addFields: {
            isGroup: {
              $cond: [
                {
                  $eq: ["$group", "Everyone"],
                },
                true,
                false,
              ],
            },
          },
        },
        {
          $lookup: {
            from: "answer_room",
            let: {
              aid: "$_id",
              questionId: "$_id",
              createdBy: "$createdBy._id",
            },
            pipeline: [
              {
                $match: {
                  participateIds: {
                    $size: 3,
                  },
                  $expr: {
                    $and: [
                      {
                        $eq: [
                          "$participateIds",
                          [
                            new ObjectId(user._id),
                            "$$questionId",
                            "$$createdBy",
                          ],
                        ],
                      },
                    ],
                  },
                },
              },
            ],
            as: "answer_room",
          },
        },
        {
          $unwind: {
            path: "$answer_room",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "answer",
            localField: "_id",
            foreignField: "question",
            let: {
              x: "$isGroup",
              y: "$answer_room._id",
              z: "$createdBy._id",
            },
            pipeline: [
              {
                $group: {
                  _id: "$question",
                  data: {
                    $push: "$$ROOT",
                  },
                },
              },
              {
                $match: {
                  data: {
                    $elemMatch: {
                      createdBy: new ObjectId(user._id),
                    },
                  },
                },
              },
              {
                $unwind: {
                  path: "$data",
                },
              },
              {
                $match: {
                  $or: [
                    {
                      $expr: {
                        $and: [
                          {
                            $eq: [false, "$$x"],
                          },
                          {
                            $eq: ["$$y", "$data.roomId"],
                          },
                          {
                            $ne: [new ObjectId(user._id), "$$z"],
                          },
                        ],
                      },
                    },
                    {
                      $expr: {
                        $and: [
                          {
                            $eq: [true, "$$x"],
                          },
                          {
                            $ne: [new ObjectId(user._id), "$$z"],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                $match: {
                  "data.seenBy": {
                    $nin: [new ObjectId(user._id)],
                  },
                  $expr: {
                    $eq: ["$$x", "$data.isGroup"],
                  },
                  "data.createdBy": {
                    $nin: [new ObjectId(user._id)],
                  },
                },
              },
            ],
            as: "totalPendingAnswers",
          },
        },
        {
          $addFields: {
            totalPendingAnswersCount: {
              $size: "$totalPendingAnswers",
            },
          },
        },
        {
          $lookup: {
            from: "verificationStatus",
            let: {
              aid: "$_id",
              questionId: "$_id",
              createdBy: "$createdBy._id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$userId", "$$createdBy"],
                      },
                    ],
                  },
                },
              },
            ],
            as: "verificationStatus",
          },
        },
        {
          $unwind: {
            path: "$verificationStatus",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            accept: "$verificationStatus.accept",
          },
        },

        {
          $addFields: {
            allowConnectionRequest: false,
          },
        },

        {
          $addFields: {
            PendingAnswer: "$totalPendingAnswersCount",
          },
        },
        {
          $group: {
            _id: "$_id",
            displayProfile: {
              $first: "$displayProfile",
            },
            allowConnectionRequest: {
              $first: "$allowConnectionRequest",
            },
            view: {
              $first: "$view",
            },
            response: {
              $first: "$response",
            },
            PendingAnswer: {
              $first: "$PendingAnswer",
            },
            status: {
              $first: "$status",
            },
            reportAbuse: {
              $first: "$reportAbuse",
            },
            share: {
              $first: "$share",
            },
            experience: {
              $first: "$experience",
            },
            dropdown: {
              $first: "$dropdown",
            },
            group: {
              $first: "$group",
            },
            reach: {
              $first: "$reach",
            },
            room: {
              $first: "$room",
            },
            new: {
              $first: "$new",
            },
            question: {
              $first: "$question",
            },
            filter: {
              $first: "$filter",
            },
            createdAt: {
              $first: "$createdAt",
            },
            isGroup: {
              $first: "$isGroup",
            },
            createdBy: {
              $first: "$createdBy",
            },
            totalPendingAnswers: {
              $first: "$totalPendingAnswers",
            },
            totalPendingAnswersCount: {
              $first: "$totalPendingAnswersCount",
            },
            verificationStatus: {
              $first: "$verificationStatus",
            },
            accept: {
              $first: "$accept",
            },
            findAnswer1: {
              $first: "$findAnswer1",
            },
            findAnswer2: {
              $first: "$findAnswer2",
            },
            answer_room1: {
              $addToSet: "$answer_room1",
            },
            answer_group: {
              $first: "$answer_group",
            },
            participateGroupId: {
              $first: "$participateGroupId",
            },
            answer_group1: {
              $first: "$answer_group1",
            },
            answer_group_respondent: {
              $first: "$answer_group_respondent",
            },
          },
        },
        {
          $sort: {
            totalPendingAnswersCount: -1,
            new: 1,
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

      let optionNames = [];
      let reachCount = async (question) => {
        // if (question.share == true) {
        // } else {
        // if (question.question == "Testing") {
        // }

        for (let k = 0; k < question?.filter?.length; k++) {
          question?.filter[k]?.options?.map(async (item) => {
            optionNames.push(item.optionName);
          });
        }

        if (optionNames.length > 0) {
          let users;
          if (question.share == true) {
            users = await global.models.GLOBAL.USER.find({
              $text: { $search: optionNames.join(" ") },
              $and: [{ shareQuestion: { $in: question._id } }],
            })
              .count()
              .then((ress) => ress);
          } else {
            users = await global.models.GLOBAL.USER.find({
              $text: { $search: optionNames.join(" ") },
            })
              .count()
              .then((ress) => ress);
          }

          // // console.log("USER-->>", users);
          if (users == 0) {
            if (question.share == true) {
              return users;
            } else {
              return await global.models.GLOBAL.USER.count();
            }
          } else {
            return users;
          }
        } else {
          if (question.share) {
            const DD = await global.models.GLOBAL.USER.find({
              $and: [{ shareQuestion: { $in: question._id } }],
            }).count();

            return DD;
          } else {
            return await global.models.GLOBAL.USER.count();
          }
        }
      };

      let PendingAnswers = (id, question) => {
        return new Promise(async (resolve, reject) => {
          if (question.createdBy != user._id) {
            if (question?.group != "Everyone") {
              let CreateRoomId = {};
              let participateIds = [];

              // check user type
              participateIds.push(user._id);
              participateIds.push(id);
              participateIds.push(question.createdBy);

              let chatRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
                participateIds: {
                  $size: participateIds.length,
                  $all: [...participateIds],
                },
              });

              const CheckAnswerMine = await global.models.GLOBAL.ANSWER.findOne(
                {
                  question: ObjectId(id),
                  createdBy: ObjectId(user._id),
                  roomId: chatRoom?._id,
                }
              );

              if (!CheckAnswerMine) {
                resolve(0);
              } else {
                const PendingAnswer =
                  await global.models.GLOBAL.ANSWER.aggregate([
                    {
                      $match: {
                        question: new ObjectId(id),
                        seenBy: {
                          $nin: [new ObjectId(user._id)],
                        },
                        createdBy: {
                          $ne: new ObjectId(user._id),
                        },
                        roomId: chatRoom?._id,
                      },
                    },
                  ]);

                resolve(PendingAnswer?.length);
              }
            } else {
              const CheckAnswerMine = await global.models.GLOBAL.ANSWER.findOne(
                {
                  question: ObjectId(id),
                  createdBy: ObjectId(user._id),
                  isGroup: true,
                }
              );

              if (!CheckAnswerMine) {
                resolve(0);
              } else {
                const PendingAnswer =
                  await global.models.GLOBAL.ANSWER.aggregate([
                    {
                      $match: {
                        question: ObjectId(id),
                        seenBy: {
                          $nin: [ObjectId(user._id)],
                        },
                        createdBy: {
                          $ne: ObjectId(user._id),
                        },
                        isGroup: true,
                      },
                    },
                  ]);

                resolve(PendingAnswer?.length);
              }
            }
          }
        });
      };
      if (question) {
        let findConection = await global.models.GLOBAL.CONNECTION.find({
          senderId: user._id,
        });

        let pandingConnection = await global.models.GLOBAL.CONNECTION.find({
          receiverId: user._id,
        });
        const conectIdExist = (id) => {
          return user.accepted.length
            ? user.accepted.some(function (el) {
                return el?.toString() == id?.toString();
              })
            : false;
        };

        const sentIdExist = (id) => {
          let check = findConection.filter(function (elc) {
            return elc.receiverId?.toString() === id?.toString();
          });
          return check.length;
        };

        const pandingIdExist = (id) => {
          let panding = pandingConnection.filter(function (elf) {
            return elf?.senderId?.toString() === id?.toString();
          });
          return panding.length;
        };

        const TotalResponse = (id, question) => {
          return new Promise(async (resolve, reject) => {
            if (question?.group == "Everyone") {
              const GetGroup = await global.models.GLOBAL.ANSWER_GROUP.findOne({
                questionId: ObjectId(id),
              }).select("_id");
              const TotalResponse = await global.models.GLOBAL.ANSWER.find({
                question: ObjectId(id),
                roomId: ObjectId(GetGroup?._id),
              }).count();

              resolve(TotalResponse);
            } else {
              const Room = await global.models.GLOBAL.ANSWER_ROOM.find({
                questionId: ObjectId(id),
                isGroup: false,
              }).select("_id");

              const TotalResponse = await global.models.GLOBAL.ANSWER.find({
                question: ObjectId(id),
                isGroup: false,
              })
                .where("roomId")
                .in(Room.map((item) => item._id))
                .count();
              resolve(TotalResponse);
            }
          });
        };

        const TotalRespondent = (id, question) => {
          return new Promise(async (resolve, reject) => {
            if (question?.group == "Everyone") {
              const GetGroup = await global.models.GLOBAL.ANSWER_GROUP.findOne({
                questionId: ObjectId(id),
              }).select("participateIds");

              resolve(
                GetGroup?.participateIds?.length
                  ? GetGroup?.participateIds?.length
                  : 0
              );
            } else {
              const TotalRespondent =
                await global.models.GLOBAL.ANSWER_ROOM.find({
                  questionId: ObjectId(id),
                  isGroup: false,
                  $and: [
                    {
                      lastMessage: { $exists: true },
                    },
                  ],
                }).count();
              resolve(TotalRespondent);
            }
          });
        };
        for (let i = 0; i < question.length; i++) {
          const checkValid =
            await global.models.GLOBAL.FULLYVERIFYSATUS.findOne({
              userId: ObjectId(question[i].createdBy._id),
            });
          let createdBy = await global.models.GLOBAL.USER.findOne(
            {
              _id: question[i].createdBy,
            },
            {
              _id: 1,
              subject: 1,
              profileImage: 1,
              name: 1,
              currentRole: 1,
            }
          );

          if (conectIdExist(question[i].createdBy?._id)) {
            let questionObj = {
              _id: question[i]._id,
              displayProfile: question[i].displayProfile,
              allowConnectionRequest: question[i].allowConnectionRequest,
              view: question[i].view,
              response: await TotalResponse(question[i]?._id, question[i]),
              status: question[i].status,
              question: question[i].question,
              filter: question[i].filter,
              createdAt: question[i].createdAt,
              dropdown: question[i].dropdown,
              room: await TotalRespondent(question[i]?._id, question[i]),
              group: question[i].group,
              experience: question[i].experience,
              new: question[i].new,
              // PendingAnswer: await PendingAnswers(
              //   question[i]?._id,
              //   question[i]
              // ),
              PendingAnswer: question[i]?.totalPendingAnswersCount,
              createdBy: createdBy,
              accept: checkValid?.accept,
              isFriend: "true",
              reach: await reachCount(question[i]),
            };
            Question.push(questionObj);
          } else if (sentIdExist(question[i].createdBy?._id)) {
            let questionObj = {
              _id: question[i]._id,
              displayProfile: question[i].displayProfile,
              allowConnectionRequest: question[i].allowConnectionRequest,
              view: question[i].view,
              response: await TotalResponse(question[i]._id, question[i]),
              status: question[i].status,
              question: question[i].question,
              filter: question[i].filter,
              createdAt: question[i].createdAt,
              experience: question[i].experience,
              dropdown: question[i].dropdown,
              room: await TotalRespondent(question[i]?._id, question[i]),
              group: question[i].group,
              createdBy: createdBy,
              new: question[i].new,
              // PendingAnswer: await PendingAnswers(
              //   question[i]?._id,
              //   question[i]
              // ),
              PendingAnswer: question[i]?.totalPendingAnswersCount,
              accept: checkValid?.accept,
              reach: await reachCount(question[i]),
              isFriend: "sent",
            };
            Question.push(questionObj);
          } else if (pandingIdExist(question[i].createdBy?._id)) {
            let questionObj = {
              _id: question[i]._id,
              displayProfile: question[i].displayProfile,
              allowConnectionRequest: question[i].allowConnectionRequest,
              view: question[i].view,
              response: await TotalResponse(question[i]?._id, question[i]),
              status: question[i].status,
              question: question[i].question,
              filter: question[i].filter,
              createdAt: question[i].createdAt,
              experience: question[i].experience,
              dropdown: question[i].dropdown,
              room: await TotalRespondent(question[i]?._id, question[i]),
              group: question[i]?.group,
              createdBy: createdBy,
              new: question[i].new,
              // PendingAnswer: await PendingAnswers(
              //   question[i]?._id,
              //   question[i]
              // ),
              PendingAnswer: question[i]?.totalPendingAnswersCount,
              accept: checkValid?.accept,
              reach: await reachCount(question[i]),
              isFriend: "pending",
            };
            Question.push(questionObj);
          } else {
            let questionObj = {
              _id: question[i]._id,
              displayProfile: question[i].displayProfile,
              allowConnectionRequest: question[i].allowConnectionRequest,
              view: question[i].view,
              response: await TotalResponse(question[i]?._id, question[i]),
              status: question[i].status,
              question: question[i].question,
              experience: question[i].experience,
              filter: question[i].filter,
              dropdown: question[i].dropdown,
              room: await TotalRespondent(question[i]?._id, question[i]),
              group: question[i].group,
              createdAt: question[i].createdAt,
              createdBy: createdBy,
              new: question[i].new,
              // PendingAnswer: await PendingAnswers(
              //   question[i]?._id,
              //   question[i]
              // ),
              PendingAnswer: question[i]?.totalPendingAnswersCount,

              accept: checkValid?.accept,
              reach: await reachCount(question[i]),
              isFriend: "false",
            };
            Question.push(questionObj);
          }
        }
        Question = JSON.parse(JSON.stringify(Question));
        if (search) {
          let abcd = Question?.filter((question) => {
            if (question.question.search(search) >= 0) {
              return question;
            } else if (question.user?.currentRole.search(search) >= 0) {
              return question;
            }
          });
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: {
              questions: abcd,
              count: abcd.length,
              page,
              limit,
            },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: {
              questions: Question,
              count: Question.length,
              page,
              limit,
            },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.NOT_FOUND)
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
