const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const ObjectId = require("mongodb").ObjectId;
// Retrieve and return all Question from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { question } = req.query;
    const { byUser } = req.query;
    const { search } = req.query;
    const { later } = req.query;
    let criteria;
    let FindQuestion;
    let AnswerLater;
    if (byUser) {
      criteria = {
        createdBy: user._id,
        createdAt: {
          $gte: user.createdAt,
        },
      };
      if (question) {
        criteria = {
          _id: question,
          createdBy: user._id,
          createdAt: {
            $gte: user.createdAt,
          },
        };
      }
    }

    if (later) {
      AnswerLater = {
        _id: { $in: user.answerLater },
      };
    } else {
      AnswerLater = {
        _id: { $nin: user.answerLater },
      };
    }
    if (question) {
      criteria = {
        _id: question,
        createdAt: {
          $gte: user.createdAt,
        },
      };
    }
    try {
      let FindUser = await global.models.GLOBAL.USER.findOne({
        _id: ObjectId(user._id),
      });
      let abuseQuestion = [];
      const { filter, viewNewquestion, questionsResponses } = req.body;

      let distinctQue;
      const QuestionsArray = [];
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;
      // let CheckFilter = filter?.length > 0 ? true : false;
      const CheckFilter = (data, filter) => {
        if (data?.length > 0) {
          return true;
        } else {
          return false;
        }
      };
      let FindCompany;
      if (user.isCompanyVerify) {
        if (user.OrgRanDomID) {
          FindCompany = await global.models.GLOBAL.USER.aggregate([
            {
              $match: {
                OrgRanDomID: user.OrgRanDomID,
                isCompanyVerify: true,
              },
            },
            {
              $project: {
                _id: 1,
                OrgRanDomID: 1,
                isCompanyId: 1,
                isCompanyVerify: 1,
              },
            },
            {
              $lookup: {
                from: "user",
                let: {
                  isCompanyId: "$isCompanyId",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ["$isCompanyId", "$$isCompanyId"],
                          },
                        ],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      isCompanyId: 1,
                      isCompanyVerify: 1,
                      OrgRanDomID: 1,
                    },
                  },
                ],
                as: "DDDDDDD",
              },
            },
            {
              $unwind: {
                path: "$DDDDDDD",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ["$OrgRanDomID", user.OrgRanDomID],
                },
              },
            },
            {
              $group: {
                _id: "$DDDDDDD._id",
              },
            },
          ]);
        } else {
          FindCompany = await global.models.GLOBAL.USER.find({
            isCompanyId: user.isCompanyId,
            isCompanyVerify: null,
          });
        }
      } else {
        FindCompany = await global.models.GLOBAL.USER.aggregate([
          {
            $match: {
              isCompanyId: user.isCompanyId,
              isCompanyVerify: true,
            },
          },
          {
            $project: {
              _id: 1,
              OrgRanDomID: 1,
              isCompanyId: 1,
              isCompanyVerify: 1,
            },
          },
          {
            $lookup: {
              from: "user",
              let: {
                orgRanDomID: "$OrgRanDomID",
                isCompanyId: "$isCompanyId",
                isCompanyVerify: "$isCompanyVerify",
              },
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    isCompanyId: 1,
                    isCompanyVerify: 1,
                    OrgRanDomID: 1,
                    matchCondition: {
                      $cond: {
                        if: {
                          $eq: ["$$orgRanDomID", null],
                        },
                        then: {
                          $and: [
                            {
                              $eq: ["$isCompanyId", "$$isCompanyId"],
                            },
                            {
                              $eq: ["$isCompanyVerify", "$$isCompanyVerify"],
                            },
                          ],
                        },
                        else: {
                          $and: [
                            {
                              $eq: ["$OrgRanDomID", "$$orgRanDomID"],
                            },
                            {
                              $eq: ["$isCompanyVerify", "$$isCompanyVerify"],
                            },
                          ],
                        },
                      },
                    },
                  },
                },
                {
                  $match: {
                    $expr: "$matchCondition",
                  },
                },
                {
                  $project: {
                    _id: 1,
                    isCompanyId: 1,
                    isCompanyVerify: 1,
                    OrgRanDomID: 1,
                  },
                },
              ],
              as: "DDDDDDD",
            },
          },
          {
            $unwind: {
              path: "$DDDDDDD",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "user",
              let: {
                orgRanDomID: "$OrgRanDomID",
                isCompanyId: "$DDDDDDD.isCompanyId",
                isCompanyVerify: "$isCompanyVerify",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$isCompanyId", "$$isCompanyId"],
                        },
                      ],
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    isCompanyId: 1,
                    isCompanyVerify: 1,
                    OrgRanDomID: 1,
                  },
                },
              ],
              as: "cccc",
            },
          },
          {
            $unwind: {
              path: "$cccc",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: "$cccc._id",
            },
          },
        ]);
      }

      const FindCompanyId = FindCompany.map((item) => item._id);

      let Questions = [];

      const checkValid = async (id) => {
        return await global.models.GLOBAL.FULLYVERIFYSATUS.findOne({
          userId: ObjectId(
            Questions.find((aid) => aid._id === id).createdBy?._id
          ),
        });
      };

      let questionsResponsesData =
        filter?.length > 0 && !viewNewquestion && !questionsResponses
          ? {
              totalPendingAnswersCount: -1,
              new: 1,
              createdAt: -1,
            }
          : viewNewquestion && !questionsResponses && filter?.length == 0
          ? {
              new: 1,
            }
          : questionsResponses && !viewNewquestion && filter?.length == 0
          ? {
              totalPendingAnswersCount: -1,
            }
          : questionsResponses && viewNewquestion && filter?.length != 0
          ? {
              totalPendingAnswersCount: -1,
              new: 1,
              createdAt: -1,
            }
          : filter?.length > 0 && viewNewquestion && !questionsResponses
          ? {
              new: 1,
            }
          : filter?.length > 0 && !viewNewquestion && questionsResponses
          ? {
              totalPendingAnswersCount: -1,
            }
          : questionsResponses && viewNewquestion && filter?.length == 0
          ? {
              totalPendingAnswersCount: -1,
              new: 1,
              createdAt: -1,
            }
          : {};

      let CheckMatchNewData;
      let CheckMatchResponseFilterData;
      let totalPendingAnswersGet;

      if (viewNewquestion) {
        CheckMatchNewData = {
          $and: [
            {
              status: "active",
            },

            {
              $expr: {
                // $and: [
                //   {
                //     $eq: [true, CheckFilter(filter)],
                //   },
                //   { $in: ["$createdBy.subject", filter] },
                // ],

                $and: [
                  {
                    $eq: [true, viewNewquestion],
                  },
                  { $eq: ["$new", 0] },
                ],
              },
            },
          ],
        };
      } else {
        CheckMatchNewData = {
          $and: [
            {
              status: "active",
            },
          ],
        };
      }

      if (CheckFilter(filter)) {
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAQQQQQQ", filter);
        CheckMatchResponseFilterData = {
          $or: [
            // {
            //   $and: [
            //     {
            //       dropdown: {
            //         $in: filter,
            //       },
            //     },
            //   ],
            // },
            {
              $and: [
                {
                  status: "active",
                },

                {
                  "filter.options": {
                    $all: filter.map((obj) => ({
                      $elemMatch: {
                        _id: ObjectId(obj._id),
                        weight: obj.weight,
                      },
                    })),
                  },
                },
              ],
            },
          ],
        };
      } else {
        CheckMatchResponseFilterData = {
          $and: [
            {
              status: "active",
            },
          ],
        };
      }

      if (questionsResponses) {
        totalPendingAnswersGet = {
          $and: [
            {
              $expr: {
                $and: [
                  {
                    $gt: ["$totalPendingAnswersCount", 0],
                  },
                ],
              },
            },
          ],
        };
      } else {
        totalPendingAnswersGet = {
          $and: [
            {
              status: "active",
            },
          ],
        };
      }

      if (filter) {
        if (search) {
          for (let i = 0; i < filter.length; i++) {
            if (filter[i] != "") {
              abuseQuestion = [];
              for (let j = 0; j < user.abuseQuestion.length; j++) {
                abuseQuestion.push(user.abuseQuestion[j].questionId);
              }
              // // console.log("Criteria ni moj", criteria);

              let qids = await global.models.GLOBAL.QUESTION.aggregate([
                {
                  $lookup: {
                    from: "user",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "user",
                  },
                },
                {
                  $match: {
                    "user.subject": filter[i],
                    displayProfile: true,
                    createdAt: {
                      $gte: user.createdAt,
                    },
                  },
                },
                // {
                //   $match: {
                //     "user.currentRole": {
                //       $regex: filter[i],
                //       $options: "i",
                //     },
                //   },
                // },
                {
                  $group: {
                    _id: "createdBy",
                    createdBy: {
                      $push: "$_id",
                    },
                  },
                },
              ]);

              let quResult = await global.models.GLOBAL.QUESTION.find({
                ...criteria,
                question: { $regex: search, $options: "i" },
                createdAt: {
                  $gte: user.createdAt,
                },

                $and: [
                  { _id: { $nin: user.answerLater } },
                  { _id: { $nin: abuseQuestion } },
                  { _id: user._id },
                  { displayProfile: true },
                  { createdBy: { $nin: user.blockUser } },
                  // { "filter.options.optionName": filter[i] },
                  { reportAbuse: { $nin: true } },
                  { _id: { $in: qids[0]?.createdBy } },
                ],
              })
                .populate({
                  path: "createdBy",
                  model: "user",
                  select: "_id name subject profileImage currentRole",
                })
                .skip(skip)
                .limit(limit)
                .sort({
                  createdAt: -1,
                })
                .exec();

              for (let j = 0; j < quResult.length; j++) {
                if (quResult[j] != null) {
                  //add if already not in array
                  let found = Questions.find(
                    (q) => q._id.toString() == quResult[j]._id.toString()
                  );
                  if (found == null) {
                    Questions.push(quResult[j]);
                  }
                }
              }
            }
          }
          distinctQue = Array.from(new Set(Questions.map((q) => q._id))).map(
            (id) => {
              return {
                _id: id,
                question: Questions.find((aid) => aid._id === id).question,
                allowConnectionRequest: Questions.find((aid) => aid._id === id)
                  .allowConnectionRequest,
                displayProfile: Questions.find((aid) => aid._id === id)
                  .displayProfile,
                view: Questions.find((aid) => aid._id === id).view,
                room: Questions.find((aid) => aid._id === id).room,
                response: Questions.find((aid) => aid._id === id).response,
                status: Questions.find((aid) => aid._id === id).status,
                filter: Questions.find((aid) => aid._id === id).filter,
                createdAt: Questions.find((aid) => aid._id === id).createdAt,
                createdBy: Questions.find((aid) => aid._id === id).createdBy,
              };
            }
          );
        } else if (!byUser) {
          console.log("filterDDDDDDDDDDDDDD", filter);
          abuseQuestion = [];
          for (let j = 0; j < user.abuseQuestion.length; j++) {
            abuseQuestion.push(user.abuseQuestion[j].questionId);
          }

          let quResult = await global.models.GLOBAL.QUESTION.aggregate([
            {
              $match: {
                // share: false,
                createdAt: {
                  $gte: user.createdAt,
                },

                $and: [
                  AnswerLater,
                  { _id: { $nin: user.removeQuestion } },
                  { _id: { $nin: [abuseQuestion] } },
                  { createdBy: { $nin: user.blockUser } },
                  { createdBy: { $nin: FindCompanyId } },
                  // { createdBy: { $nin: user._id } },
                  // { reportAbuse: { $nin: [true] } },
                  // { displayProfile: true },
                  // { "filter.options.optionName": filter[i] },
                  // { _id: { $in: qids[0]?.createdBy } },
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
              $match: {
                ...CheckMatchNewData,
              },
            },

            {
              $match: {
                $or: [
                  {
                    share: false,
                  },
                  {
                    $expr: {
                      $and: [
                        { $eq: [true, "$share"] },
                        { $in: ["$_id", FindUser.shareQuestion] },
                      ],
                    },
                  },
                ],
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
              },
            },

            {
              $match: {
                ...CheckMatchResponseFilterData,
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
                  z: "createdBy._id",
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
                        // {
                        //   $expr: {
                        //     $ne: [new ObjectId(user._id), "$$z"],
                        //   },
                        // },

                        {
                          $expr: {
                            $and: [
                              { $eq: [false, "$$x"] },
                              { $eq: ["$$y", "$data.roomId"] },
                              { $ne: [new ObjectId(user._id), "$$z"] },
                            ],
                          },
                        },

                        {
                          $expr: {
                            $and: [
                              { $eq: [true, "$$x"] },
                              // { $eq: ["$$y", "$data.roomId"] },
                              { $ne: [new ObjectId(user._id), "$$z"] },
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
              $match: {
                ...totalPendingAnswersGet,
              },
            },

            {
              $sort: {
                ...questionsResponsesData,
              },
            },

            // {
            //   $skip: skip,
            // },

            // {
            //   $limit: limit,
            // },
          ]);

          for (let j = 0; j < quResult.length; j++) {
            if (quResult[j] != null) {
              //add if already not in array
              let found = Questions.find(
                (q) => q._id.toString() == quResult[j]._id.toString()
              );
              if (found == null) {
                Questions.push(quResult[j]);
              }
            }
          }

          Questions = new Set(Questions);
          //set to array
          Questions = Array.from(Questions);

          distinctQue = Array.from(new Set(Questions.map((q) => q._id))).map(
            (id) => {
              return {
                _id: id,
                question: Questions.find((aid) => aid._id === id).question,
                allowConnectionRequest: Questions.find((aid) => aid._id === id)
                  .allowConnectionRequest,
                displayProfile: Questions.find((aid) => aid._id === id)
                  .displayProfile,
                view: Questions.find((aid) => aid._id === id).view,
                room: Questions.find((aid) => aid._id === id).room,
                response: Questions.find((aid) => aid._id === id).response,
                status: Questions.find((aid) => aid._id === id).status,
                filter: Questions.find((aid) => aid._id === id).filter,
                createdAt: Questions.find((aid) => aid._id === id).createdAt,
                createdBy: Questions.find((aid) => aid._id === id).createdBy,
                userName: Questions.find((aid) => aid._id === id).createdBy
                  .name,
                dropdown: Questions.find((aid) => aid._id === id).dropdown,
                experience: Questions.find((aid) => aid._id === id).experience,
                share: Questions.find((aid) => aid._id === id).share,
                accept: checkValid(id)?.accept,
                group: Questions.find((aid) => aid._id === id)?.group,
                new: Questions.find((aid) => aid._id === id)?.new,
                PendingAnswer: Questions.find((aid) => aid._id === id)
                  ?.totalPendingAnswersCount,
              };
            }
          );
        } else {
          console.log("else ccccccccccccccc", criteria);
          abuseQuestion = [];
          for (let j = 0; j < user.abuseQuestion.length; j++) {
            abuseQuestion.push(user.abuseQuestion[j].questionId);
          }

          // // console.log("criteria ni", criteria);
          let quResult = await global.models.GLOBAL.QUESTION.aggregate([
            {
              $match: {
                // share: false,
                createdAt: {
                  $gte: user.createdAt,
                },

                $and: [
                  { _id: { $nin: user.answerLater } },
                  { _id: { $nin: user.removeQuestion } },
                  { _id: { $nin: abuseQuestion } },
                  { createdBy: { $nin: user.blockUser } },
                  { createdBy: user._id },
                  // { displayProfile: true },
                  // { reportAbuse: { $nin: true } },
                  // { "filter.options.optionName": filter[i] },
                  // { createdBy: { $nin: user._id } },
                  // { reportAbuse: { $nin: [true] } },
                  // { displayProfile: true },
                  // { "filter.options.optionName": filter[i] },
                  // { _id: { $in: qids[0]?.createdBy } },
                ],
                // $or: [
                //   { "filter.options.optionName": { $exists: false } },
                //   { "filter.options.optionName": { $in: user.subject } },
                // ],

                status: "active",
              },
            },

            {
              $match: {
                ...CheckMatchNewData,
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
              },
            },

            {
              $match: {
                ...CheckMatchResponseFilterData,
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
                  createdBy: "createdBy._id",
                },
                pipeline: [
                  {
                    $match: {
                      participateIds: {
                        $all: [
                          ObjectId(user._id),
                          "$$questionId",
                          "$$createdBy",
                        ],
                        $size: 3,
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
                            $ne: [new ObjectId(user._id), "$$z"],
                          },
                        },
                        {
                          $expr: {
                            $and: [
                              { $eq: [false, "$$x"] },
                              { $eq: ["$$y", "$data.roomId"] },
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
              $match: {
                ...totalPendingAnswersGet,
              },
            },

            {
              $sort: {
                ...questionsResponsesData,
              },
            },

            // {
            //   $skip: skip,
            // },

            // {
            //   $limit: limit,
            // },
          ]);

          for (let j = 0; j < quResult.length; j++) {
            if (quResult[j] != null) {
              //add if already not in array
              let found = Questions.find(
                (q) => q._id.toString() == quResult[j]._id.toString()
              );
              if (found == null) {
                Questions.push(quResult[j]);
              }
            }
          }

          //set to array
          Questions = Array.from(Questions);
          distinctQue = Array.from(new Set(Questions.map((q) => q._id))).map(
            (id) => {
              return {
                _id: id,
                question: Questions.find((aid) => aid._id === id).question,
                allowConnectionRequest: Questions.find((aid) => aid._id === id)
                  .allowConnectionRequest,
                displayProfile: Questions.find((aid) => aid._id === id)
                  .displayProfile,
                view: Questions.find((aid) => aid._id === id).view,
                room: Questions.find((aid) => aid._id === id).room,
                response: Questions.find((aid) => aid._id === id).response,
                status: Questions.find((aid) => aid._id === id).status,
                filter: Questions.find((aid) => aid._id === id).filter,
                createdAt: Questions.find((aid) => aid._id === id).createdAt,
                createdBy: Questions.find((aid) => aid._id === id).createdBy,
                userName: Questions.find((aid) => aid._id === id).createdBy
                  .name,
                dropdown: Questions.find((aid) => aid._id === id).dropdown,
                experience: Questions.find((aid) => aid._id === id).experience,
                share: Questions.find((aid) => aid._id === id).share,
                accept: checkValid(id)?.accept,
                group: Questions.find((aid) => aid._id === id)?.group,
                new: Questions.find((aid) => aid._id === id)?.new,
                PendingAnswer: Questions.find((aid) => aid._id === id)
                  ?.totalPendingAnswersCount,
                // reach: 0,
              };
            }
          );
        }
        let findConection = await global.models.GLOBAL.CONNECTION.find({
          senderId: user._id,
        });

        let pandingConnection = await global.models.GLOBAL.CONNECTION.find({
          receiverId: user._id,
        });
        const conectIdExist = (id) => {
          return user.accepted.length
            ? user.accepted.some(function (el) {
                return el.toString() == id.toString();
              })
            : false;
        };

        const sentIdExist = (id) => {
          let check = findConection.filter(function (elc) {
            return elc.receiverId.toString() === id.toString();
          });
          return check.length;
        };

        const pandingIdExist = (id) => {
          let panding = pandingConnection.filter(function (elf) {
            return elf.senderId.toString() === id.toString();
          });
          return panding.length;
        };
        let optionNames = [];
        let reachCount = async (question) => {
          // if (question.share == true) {
          // } else {
          // if (question.question == "Testing") {
          //   console.log("AAAAAAASSSSSSSSSSDDDDDDDD", question);
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

        for (let i = 0; i < distinctQue.length; i++) {
          distinctQue[i]["reach"] = await reachCount(distinctQue[i]);

          if (conectIdExist(distinctQue[i]._id)) {
            let questionObj = {
              question: distinctQue[i],
              isFriend: "true",
            };
            QuestionsArray.push(questionObj);
          } else if (sentIdExist(distinctQue[i]._id)) {
            let questionObj = {
              question: distinctQue[i],
              isFriend: "sent",
            };
            QuestionsArray.push(questionObj);
          } else if (pandingIdExist(distinctQue[i]._id)) {
            let questionObj = {
              question: distinctQue[i],
              isFriend: "pending",
            };
            QuestionsArray.push(questionObj);
          } else {
            let questionObj = {
              question: distinctQue[i],
              isFriend: "false",
            };
            QuestionsArray.push(questionObj);
          }

          // if (reachCount(distinctQue[i])) {
          //   distinctQue[i].reach == reachCount(distinctQue[i]);
          // }
        }
        // console.log("AAASSSDDDFFF", distinctQue);

        // FindQuestion = distinctQue.sort(function (a, b) {
        //   var textA = a.createdAt;
        //   var textB = b.createdAt;
        //   return textA < textB ? -1 : textA > textB ? 1 : 0;
        // });

        FindQuestion = distinctQue.sort(function (a, b) {
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // const FindQuestion =   questionFilters.map((filter) => {
        //     const Handle = filter?.options
        //       ?.filter((item) => item.status == true)
        //       .sort(function (a, b) {
        //         var textA = a.optionName;
        //         var textB = b.optionName;
        //         return textA < textB ? -1 : textA > textB ? 1 : 0;
        //       });}
      } else {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.INVALID_PARAMETERS,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      }
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: {
          questions: FindQuestion,
          count: FindQuestion.length,
          page,
          limit,
        },
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
