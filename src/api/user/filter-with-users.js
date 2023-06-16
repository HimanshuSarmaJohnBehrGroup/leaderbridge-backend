const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");
const { ObjectId } = require("mongodb");
// Retrieve and return all Question from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { filter, questionId } = req.body;
    const { total, All } = req.query;
    let QuesId = questionId ? [ObjectId(questionId)] : [];

    let FinalFilter = [];

    // let TotalSkip = req.body.page && {
    //   $skip: skip,
    // } ?

    // let TotalLimit = req.body.limit && {
    //   $limit: limit,
    // };

    req.body.page = req.body.page ? req.body.page : 1;
    let page = parseInt(req.body.page);
    req.body.limit = req.body.limit ? req.body.limit : 10;
    let limit = parseInt(req.body.limit);
    let skip = (parseInt(req.body.page) - 1) * limit;

    const LoadingData = await filter?.map((item) => {
      return item.options?.map((ss) => {
        return FinalFilter.push(ss.optionName);
      });
    });

    let userId = [];
    let findMatching = await global.models.GLOBAL.MATCHING.find({
      matchingBy: user._id,
    });

    if (user?.userType != "admin" && !total) {
      let alllUsers;
      let FindCompany;

      if (user.isCompanyVerify) {
        FindCompany = await global.models.GLOBAL.USER.find({
          isCompanyId: user.isCompanyId,
          isCompanyVerify: null,
        });
      } else {
        FindCompany = await global.models.GLOBAL.USER.find({
          isCompanyId: user.isCompanyId,
          isCompanyVerify: true,
        });
      }

      const FindCompanyId = FindCompany.map((item) => item._id);

      console.log("FindCompanyId", FinalFilter);

      if (FinalFilter.length) {
        if (All) {
          alllUsers = await global.models.GLOBAL.USER_FILTER.aggregate([
            {
              $match: {
                $and: [
                  {
                    displayProfile: true,
                  },
                  {
                    "options.optionName": {
                      $in: FinalFilter,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "user",
                localField: "userId",
                foreignField: "_id",
                as: "userId",
              },
            },
            {
              $unwind: {
                path: "$userId",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $group: {
                _id: "$userId._id",
                matches: {
                  $first: 1,
                },
                name: {
                  $first: "$userId.name",
                },
                email: {
                  $first: "$userId.email",
                },
                region: {
                  $first: "$userId.region",
                },
                profileImage: {
                  $first: "$userId.profileImage",
                },
                currentRole: {
                  $first: "$userId.currentRole",
                },
                subject: {
                  $first: "$userId.subject",
                },
                createdAt: {
                  $first: "$userId.createdAt",
                },
                lastLogin: {
                  $first: "$userId.lastLogin",
                },
                accepted: {
                  $first: "$userId.accepted",
                },
                shareQuestion: {
                  $first: "$userId.shareQuestion",
                },
                status: {
                  $first: "$userId.status",
                },
                isOrganization: {
                  $first: "$userId.isOrganizations",
                },
              },
            },
            {
              $match: {
                shareQuestion: { $nin: QuesId },
                $and: [
                  { _id: { $ne: ObjectId(user._id) } },
                  { _id: { $nin: userId } },
                  {
                    subject: {
                      $size: 4,
                    },
                  },

                  { isOrganization: { $ne: true } },
                ],

                // $or: [
                //   { yourCompanyFounded: { $in: FinalFilter } },
                //   { countryOfOrigin: { $in: FinalFilter } },
                //   { fundingRoundStatus: { $in: FinalFilter } },
                //   { targetMarket: { $in: FinalFilter } },
                //   { ethnicity: { $in: FinalFilter } },
                //   { sexualOrientation: { $in: FinalFilter } },
                //   { numberOfcompany: { $in: FinalFilter } },
                //   { numberOffulltimeStaff: { $in: FinalFilter } },
                //   { countryOfResidence: { $in: FinalFilter } },
                //   { region: { $in: FinalFilter } },
                //   { politicalAffiliation: { $in: FinalFilter } },
                //   { industry: { $in: FinalFilter } },
                //   { currentRole: { $in: FinalFilter } },
                //   { employeeNumber: { $in: FinalFilter } },
                //   { religiousAffiliation: { $in: FinalFilter } },
                //   { levelOfEducation: { $in: FinalFilter } },
                //   { subject: { $in: FinalFilter } },
                //   { TypeofStartup: { $in: FinalFilter } },
                //   // { sexualOrientation: { $in: FinalFilter } },
                //   // { shareQuestion: { $nin: QuesId } },
                // ],
              },
            },

            {
              $lookup: {
                from: "question",
                let: {
                  id: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$id", "$createdBy"],
                      },
                    },
                  },
                ],
                as: "questionCount",
              },
            },
            {
              $lookup: {
                from: "answer",
                let: {
                  id: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$id", "$createdBy"],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: "$question",
                    },
                  },
                ],
                as: "answerCount",
              },
            },
            {
              $addFields: {
                questionCount: {
                  $size: "$questionCount",
                },
                answerCount: {
                  $size: "$answerCount",
                },
              },
            },
            {
              $group: {
                _id: "$_id",
                matches: {
                  $sum: 1,
                },
                name: {
                  $first: "$name",
                },
                email: {
                  $first: "$email",
                },
                region: {
                  $first: "$region",
                },
                profileImage: {
                  $first: "$profileImage",
                },
                currentRole: {
                  $first: "$currentRole",
                },
                subject: {
                  $first: "$subject",
                },
                createdAt: {
                  $first: "$createdAt",
                },
                lastLogin: {
                  $first: "$lastLogin",
                },
                accepted: {
                  $first: "$accepted",
                },
                questionCount: {
                  $first: "$questionCount",
                },
                answerCount: {
                  $first: "$answerCount",
                },
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
          ]);
        } else {
          alllUsers = await global.models.GLOBAL.USER_FILTER.aggregate([
            {
              $match: {
                $and: [
                  {
                    displayProfile: true,
                  },
                  {
                    "options.optionName": {
                      $in: FinalFilter,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "user",
                localField: "userId",
                foreignField: "_id",
                as: "userId",
              },
            },
            {
              $unwind: {
                path: "$userId",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $group: {
                _id: "$userId._id",
                matches: {
                  $first: 1,
                },
                name: {
                  $first: "$userId.name",
                },
                email: {
                  $first: "$userId.email",
                },
                region: {
                  $first: "$userId.region",
                },
                profileImage: {
                  $first: "$userId.profileImage",
                },
                currentRole: {
                  $first: "$userId.currentRole",
                },
                subject: {
                  $first: "$userId.subject",
                },
                createdAt: {
                  $first: "$userId.createdAt",
                },
                lastLogin: {
                  $first: "$userId.lastLogin",
                },
                accepted: {
                  $first: "$userId.accepted",
                },
                shareQuestion: {
                  $first: "$userId.shareQuestion",
                },
                status: {
                  $first: "$userId.status",
                },
                isOrganization: {
                  $first: "$userId.isOrganizations",
                },
              },
            },
            {
              $match: {
                shareQuestion: { $nin: QuesId },
                $and: [
                  { _id: { $ne: ObjectId(user._id) } },
                  { _id: { $nin: userId } },
                  {
                    subject: {
                      $size: 4,
                    },
                  },

                  { isOrganization: { $ne: true } },
                ],

                // $or: [
                //   { yourCompanyFounded: { $in: FinalFilter } },
                //   { countryOfOrigin: { $in: FinalFilter } },
                //   { fundingRoundStatus: { $in: FinalFilter } },
                //   { targetMarket: { $in: FinalFilter } },
                //   { ethnicity: { $in: FinalFilter } },
                //   { sexualOrientation: { $in: FinalFilter } },
                //   { numberOfcompany: { $in: FinalFilter } },
                //   { numberOffulltimeStaff: { $in: FinalFilter } },
                //   { countryOfResidence: { $in: FinalFilter } },
                //   { region: { $in: FinalFilter } },
                //   { politicalAffiliation: { $in: FinalFilter } },
                //   { industry: { $in: FinalFilter } },
                //   { currentRole: { $in: FinalFilter } },
                //   { employeeNumber: { $in: FinalFilter } },
                //   { religiousAffiliation: { $in: FinalFilter } },
                //   { levelOfEducation: { $in: FinalFilter } },
                //   { subject: { $in: FinalFilter } },
                //   { TypeofStartup: { $in: FinalFilter } },
                //   // { sexualOrientation: { $in: FinalFilter } },
                //   // { shareQuestion: { $nin: QuesId } },
                // ],
              },
            },

            {
              $lookup: {
                from: "question",
                let: {
                  id: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$id", "$createdBy"],
                      },
                    },
                  },
                ],
                as: "questionCount",
              },
            },
            {
              $lookup: {
                from: "answer",
                let: {
                  id: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$id", "$createdBy"],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: "$question",
                    },
                  },
                ],
                as: "answerCount",
              },
            },
            {
              $addFields: {
                questionCount: {
                  $size: "$questionCount",
                },
                answerCount: {
                  $size: "$answerCount",
                },
              },
            },

            // {
            //   $lookup: {
            //     from: "user_filter",
            //     localField: "_id",
            //     foreignField: "userId",
            //     pipeline: [
            //       {
            //         $match: {
            //           $and: [
            //             {
            //               displayProfile: true,
            //             },
            //           ],
            //         },
            //       },
            //     ],
            //     as: "filter",
            //   },
            // },
            {
              $group: {
                _id: "$_id",
                matches: {
                  $sum: 1,
                },
                name: {
                  $first: "$name",
                },
                email: {
                  $first: "$email",
                },
                region: {
                  $first: "$region",
                },
                profileImage: {
                  $first: "$profileImage",
                },
                currentRole: {
                  $first: "$currentRole",
                },
                subject: {
                  $first: "$subject",
                },
                createdAt: {
                  $first: "$createdAt",
                },

                // filter: {
                //   $first: "$filter",
                // },
                lastLogin: {
                  $first: "$lastLogin",
                },
                accepted: {
                  $first: "$accepted",
                },
                questionCount: {
                  $first: "$questionCount",
                },
                answerCount: {
                  $first: "$answerCount",
                },
              },
            },

            {
              $lookup: {
                from: "legends",
                let: {
                  subject: {
                    $arrayElemAt: ["$subject", 0],
                  },
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$legendsName", "$$subject"],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: "$_id",
                      legendsName: "$legendsName",
                      legendsIcon: "$legendsIcon",
                    },
                  },
                ],
                as: "subjectFirst",
              },
            },
            {
              $unwind: {
                path: "$subjectFirst",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $addFields: {
                profileImage: "$subjectFirst.legendsIcon",
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
        }
      }

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: { users: alllUsers, count: alllUsers.length },
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
      //   } catch (e) {
      //     const data4createResponseObject = {
      //       req: req,
      //       result: -1,
      //       message: messages.GENERAL,
      //       payload: {},
      //       logPayload: false,
      //     };
      //     res
      //       .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
      //       .json(utils.createResponseObject(data4createResponseObject));
      //   }
    } else if (user?.userType != "admin" && total) {
      let alllUsers;
      let FindCompany;

      if (user.isCompanyVerify) {
        FindCompany = await global.models.GLOBAL.USER.find({
          isCompanyId: user.isCompanyId,
          isCompanyVerify: null,
        });
      } else {
        FindCompany = await global.models.GLOBAL.USER.find({
          isCompanyId: user.isCompanyId,
          isCompanyVerify: true,
        });
      }

      const FindCompanyId = FindCompany.map((item) => item._id);

      alllUsers = await global.models.GLOBAL.USER.aggregate([
        {
          $facet: {
            zero: [
              {
                $match: {
                  _id: { $nin: FindCompanyId },
                  subject: {
                    $size: 4,
                  },
                  isOrganization: { $ne: true },
                },
              },
              {
                $project: {
                  _id: "$_id",
                },
              },
              // {
              //   $addFields: {
              //     matches: 0,
              //   },
              // },
            ],
            other: [
              {
                $match: {
                  isOrganization: { $ne: true },
                },
              },
              {
                $unwind: "$subject",
              },

              // {
              //   $group: {
              //     _id: "$_id",
              //     matches: {
              //       $sum: 1,
              //     },
              //   },
              // },
              // {
              //   $sort: {
              //     matches: -1,
              //   },
              // },
            ],
          },
        },
        {
          $project: {
            alldata: {
              $setUnion: ["$other", "$zero"],
            },
          },
        },
        {
          $unwind: {
            path: "$alldata",
          },
        },
        {
          $project: {
            _id: "$alldata._id",
            // matches: "$alldata.matches",
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
          },
        },
        {
          $project: {
            _id: 1,
            matches: 1,
            name: "$user.name",
            email: "$user.email",
            region: "$user.region",
            profileImage: "$user.profileImage",
            currentRole: "$user.currentRole",
            subject: "$user.subject",
            createdAt: "$user.createdAt",
            lastLogin: "$user.lastLogin",
            accepted: "$user.accepted",
          },
        },
        {
          $match: {
            shareQuestion: { $nin: QuesId },
            $and: [
              { _id: { $ne: ObjectId(user._id) } },
              { _id: { $nin: userId } },
              {
                subject: {
                  $size: 4,
                },
              },

              { isOrganization: { $ne: true } },
            ],
          },
        },
        {
          $lookup: {
            from: "question",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$$id", "$createdBy"],
                  },
                },
              },
            ],
            as: "questionCount",
          },
        },
        {
          $lookup: {
            from: "answer",
            let: {
              id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$$id", "$createdBy"],
                  },
                },
              },
              {
                $group: {
                  _id: "$question",
                },
              },
            ],
            as: "answerCount",
          },
        },

        {
          $addFields: {
            questionCount: {
              $size: "$questionCount",
            },
          },
        },
        {
          $addFields: {
            answerCount: {
              $size: "$answerCount",
            },
          },
        },

        {
          $group: {
            _id: "$_id",
            matches: {
              $sum: 1,
            },

            name: {
              $first: "$name",
            },
            email: {
              $first: "$email",
            },
            region: {
              $first: "$region",
            },
            profileImage: {
              $first: "$profileImage",
            },
            currentRole: {
              $first: "$currentRole",
            },
            subject: {
              $first: "$subject",
            },
            createdAt: {
              $first: "$createdAt",
            },
            lastLogin: {
              $first: "$lastLogin",
            },
            accepted: {
              $first: "$accepted",
            },
            questionCount: {
              $first: "$questionCount",
            },
            answerCount: {
              $first: "$answerCount",
            },
          },
        },

        {
          $lookup: {
            from: "legends",
            let: {
              subject: {
                $arrayElemAt: ["$subject", 0],
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$legendsName", "$$subject"],
                  },
                },
              },
              {
                $project: {
                  _id: "$_id",
                  legendsName: "$legendsName",
                  legendsIcon: "$legendsIcon",
                },
              },
            ],
            as: "subjectFirst",
          },
        },
        {
          $unwind: {
            path: "$subjectFirst",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            profileImage: "$subjectFirst.legendsIcon",
          },
        },

        {
          $sort: {
            createdAt: -1,
          },
        },
      ]).sort({
        createdAt: -1,
      });

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: { users: alllUsers, count: alllUsers.length },
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    } else {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.NOT_ALLOWED,
        payload: {},
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.UNAUTHORIZED)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    res.status(200).send({
      user: user,
    });
  },
};
