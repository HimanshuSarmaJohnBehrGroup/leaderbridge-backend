const { ObjectID } = require("bson");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const ObjectId = require("mongodb").ObjectId;
const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Block-user List from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;

    const questionAsked = await global.models.GLOBAL.QUESTION.count({
      createdBy: user._id,
      status: "active",
      createdAt: {
        $gte: user.createdAt,
      },
    });

    let abuseQuestion = [];
    for (var i = 0; i < user.abuseQuestion.length; i++) {
      abuseQuestion.push(user.abuseQuestion[i].questionId);
    }
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

    let allQuestion = await global.models.GLOBAL.QUESTION.aggregate([
      // {
      //   $match: {
      //     _id: new ObjectId("63ee09bbdaaad81f94aa229e"),
      //   },
      // },

      {
        $match: {
          // share: false,
          $and: [
            // { createdBy: { $nin: [uuid] } },
            { createdBy: { $nin: FindCompanyId } },
            { createdBy: { $ne: null } },
            { _id: { $nin: user.answerLater } },
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
        $match: {
          $or: [
            {
              share: false,
            },
            {
              $expr: {
                $and: [
                  { $eq: [true, "$share"] },
                  { $in: ["$_id", user.shareQuestion] },
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
                        [new ObjectId(user._id), "$$questionId", "$$createdBy"],
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
          reach: {
            $first: "$reach",
          },
          group: {
            $first: "$group",
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
          // totalPendingAnswers: {
          //   $first: "$totalPendingAnswers",
          // },
          totalPendingAnswersCount: {
            $first: "$totalPendingAnswersCount",
          },
          // verificationStatus: {
          //   $first: "$verificationStatus",
          // },
          accept: {
            $first: "$accept",
          },
          // findAnswer1: {
          //   $first: "$findAnswer1",
          // },
          // findAnswer2: {
          //   $first: "$findAnswer2",
          // },
          // answer_room1: {
          //   $addToSet: "$answer_room1",
          // },
          // answer_group: {
          //   $first: "$answer_group",
          // },
          // participateGroupId: {
          //   $first: "$participateGroupId",
          // },
          // answer_group1: {
          //   $first: "$answer_group1",
          // },
          // answer_group_respondent: {
          //   $first: "$answer_group_respondent",
          // },
        },
      },

      {
        $sort: {
          totalPendingAnswersCount: -1,
          // new: 1,
          createdAt: -1,
        },
      },

      {
        $count: "total",
      },
    ]);

    let answerLaterCount = await global.models.GLOBAL.QUESTION.aggregate([
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
                        [new ObjectId(user._id), "$$questionId", "$$createdBy"],
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
        $count: "total",
      },
    ]);

    const data4createResponseObject = {
      req: req,
      result: 0,
      message: messages.ITEM_FETCHED,
      payload: {
        questionAskedCount: questionAsked,
        answerLaterCount: answerLaterCount[0]?.total
          ? answerLaterCount[0]?.total
          : 0,
        // getAnswerCount: cc,
        questionReceivedCount: allQuestion[0]?.total
          ? allQuestion[0]?.total
          : 0,
      },
      logPayload: false,
    };
    res
      .status(enums.HTTP_CODES.OK)
      .json(utils.createResponseObject(data4createResponseObject));
  },
};
