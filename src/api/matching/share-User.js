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
    const { questionId } = req.body;

    let QuesId = questionId ? [ObjectId(questionId)] : [];
    try {
      let userId = [];
      let findMatching = await global.models.GLOBAL.MATCHING.find({
        matchingBy: user._id,
      });
      // // console.log("findMatching--->>", findMatching);
      for (let i = 0; i < findMatching.length; i++) {
        userId.push(findMatching[i].matchingTo);
      }
      req.body.page = req.body.page ? req.body.page : 1;
      let page = parseInt(req.body.page);
      req.body.limit = req.body.limit ? req.body.limit : 10;
      let limit = parseInt(req.body.limit);
      let skip = (parseInt(req.body.page) - 1) * limit;

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

      let findSameSubjectUser = await global.models.GLOBAL.USER.aggregate([
        {
          $match: {
            isOrganization: { $ne: true },
            _id: { $nin: FindCompanyId },
            shareQuestion: { $nin: QuesId },
            userType: "user",

            subject: {
              $size: 4,
            },
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
            countryOfResidence: "$user.countryOfResidence",
            isOrganization: "$user.isOrganization",
          },
        },

        {
          $group: {
            _id: "$_id",
            matches: { $first: "$matches" },
            name: { $first: "$name" },
            email: { $first: "$email" },
            region: { $first: "$region" },
            profileImage: { $first: "$profileImage" },
            currentRole: { $first: "$currentRole" },
            subject: { $first: "$subject" },
            createdAt: { $first: "$createdAt" },
            lastLogin: { $first: "$lastLogin" },
            accepted: { $first: "$accepted" },
            isOrganization: { $first: "$isOrganization" },
            countryOfResidence: { $first: "$countryOfResidence" },
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
        // {
        //   $sort: {
        //     _id: 1,
        //     createdAt: "-1",
        //   },
        // },
        // {
        //   $sort: {
        //     _id: 1,
        //     createdAt: "-1",
        //   },
        // },
      ]);

      let CountUser = await global.models.GLOBAL.USER.count({
        isOrganization: { $ne: true },
        _id: { $nin: FindCompanyId },
        shareQuestion: { $nin: QuesId },
        userType: "user",
        subject: {
          $size: 4,
        },
      });
      // .sort({
      //   createdAt: -1,
      // })
      // .skip(skip)
      // .limit(limit);

      //   return res.send(findSameSubjectUser);
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_FETCHED,
        payload: {
          findSameSubjectUser: findSameSubjectUser.reverse(),
          count: CountUser,
          page: page,
          limit: limit,
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
