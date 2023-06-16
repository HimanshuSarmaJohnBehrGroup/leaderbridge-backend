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

    if (user?.userType === "admin") {
      try {
        let alllUsers = await global.models.GLOBAL.USER.aggregate([
          {
            $match: {
              userType: "user",
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $lookup: {
              from: "question",
              localField: "_id",
              foreignField: "createdBy",
              as: "questionList",
            },
          },

          {
            $lookup: {
              from: "verificationStatus",
              localField: "_id",
              foreignField: "userId",
              as: "verification",
            },
          },
          // {
          //   $match: {
          //     OrgRanDomID: { $ne: null },
          //   },
          // },
          {
            $lookup: {
              from: "user",
              let: { oid: "$OrgRanDomID", uid: "$_id" },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ["$$oid", "$OrgRanDomID"] } },
                      { $expr: { $ne: ["$$oid", null] } },

                      { $expr: { $ne: ["$OrgRanDomID", null] } },
                      { $expr: { $ne: ["$$uid", "$_id"] } },
                      { isOrganization: true },
                    ],
                  },
                },
              ],
              as: "user",
            },
          },

          {
            $unwind: {
              path: "$user",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $lookup: {
              from: "user_filter",
              localField: "_id",
              foreignField: "userId",
              as: "filter",
            },
          },

          {
            $lookup: {
              from: "answer",
              localField: "_id",
              foreignField: "createdBy",
              as: "answerList",
            },
          },
          {
            $project: {
              _id: 1,
              user: 1,
              profileImage: 1,
              verified: 1,
              formFilled: 1,
              userType: 1,
              createdBy: 1,
              updatedBy: 1,
              abuseQuestion: 1,
              abuseAnswer: 1,
              answerLater: 1,
              removeQuestion: 1,
              blockUser: 1,
              accepted: 1,
              status: 1,
              message: 1,
              text: 1,
              organizationName: 1,
              currentRole: 1,
              region: 1,
              organizationEmail: 1,
              organizationEmailVerified: 1,
              linkedinProfile: 1,
              organizationWebsite: 1,
              otherLink: 1,
              howDidFind: 1,
              subject: 1,
              regionShow: 1,
              currentRoleShow: 1,
              DOB: 1,
              DOBShow: 1,
              countryOfOrigin: 1,
              countryOfOriginShow: 1,
              gender: 1,
              gendereShow: 1,
              countryOfResidence: 1,
              countryOfResidenceShow: 1,
              industry: 1,
              industryShow: 1,
              employeeNumber: 1,
              employeeNumberShow: 1,
              ethnicity: 1,
              ethnicityShow: 1,
              politicalAffiliation: 1,
              politicalAffiliationShow: 1,
              religiousAffiliation: 1,
              religiousAffiliationShow: 1,
              levelOfEducation: 1,
              levelOfEducationShow: 1,
              sexualOrientation: 1,
              sexualOrientationShow: 1,
              notificationSound: 1,
              messageSound: 1,
              email: 1,
              name: 1,
              createdAt: 1,
              updatedAt: 1,
              lastLogin: 1,
              matched: 1,
              isSubmit: 1,
              fullyVerified: 1,
              questionCount: {
                $size: "$questionList",
              },
              filter: 1,
              verification: 1,
              answerCount: {
                $size: "$answerList",
              },
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
        ]);

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
      } catch (e) {
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
