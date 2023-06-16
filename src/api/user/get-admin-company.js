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
    // const { organizationId } = req.query;

    // console.log("USSSSSSSSWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW");
    // console.log("organizationId", user);

    // const data4createResponseObject = {
    //   req: req,
    //   result: 0,
    //   message: messages.SUCCESS,
    //   // payload: { users: alllUsers, count: alllUsers.length },
    //   logPayload: false,
    // };
    // res
    //   .status(enums.HTTP_CODES.OK)
    //   .json(utils.createResponseObject(data4createResponseObject));

    try {
      //   let alllUsers = await global.models.GLOBAL.USER.aggregate([
      //     {
      //       $match: {
      //         organizationId: ObjectId(organizationId),
      //       },
      //     },
      //     {
      //       $sort: {
      //         createdAt: -1,
      //       },
      //     },
      //     {
      //       $lookup: {
      //         from: "question",
      //         localField: "_id",
      //         foreignField: "createdBy",
      //         as: "questionList",
      //       },
      //     },
      //     {
      //       $lookup: {
      //         from: "answer",
      //         localField: "_id",
      //         foreignField: "createdBy",
      //         as: "answerList",
      //       },
      //     },
      //     {
      //       $project: {
      //         _id: 1,
      //         profileImage: 1,
      //         verified: 1,
      //         formFilled: 1,
      //         userType: 1,
      //         createdBy: 1,
      //         updatedBy: 1,
      //         abuseQuestion: 1,
      //         abuseAnswer: 1,
      //         answerLater: 1,
      //         removeQuestion: 1,
      //         blockUser: 1,
      //         accepted: 1,
      //         status: 1,
      //         message: 1,
      //         text: 1,
      //         organizationName: 1,
      //         currentRole: 1,
      //         region: 1,
      //         organizationEmail: 1,
      //         organizationEmailVerified: 1,
      //         linkedinProfile: 1,
      //         organizationWebsite: 1,
      //         otherLink: 1,
      //         howDidFind: 1,
      //         subject: 1,
      //         regionShow: 1,
      //         currentRoleShow: 1,
      //         DOB: 1,
      //         DOBShow: 1,
      //         countryOfOrigin: 1,
      //         countryOfOriginShow: 1,
      //         gender: 1,
      //         gendereShow: 1,
      //         countryOfResidence: 1,
      //         countryOfResidenceShow: 1,
      //         industry: 1,
      //         industryShow: 1,
      //         employeeNumber: 1,
      //         employeeNumberShow: 1,
      //         ethnicity: 1,
      //         ethnicityShow: 1,
      //         politicalAffiliation: 1,
      //         politicalAffiliationShow: 1,
      //         religiousAffiliation: 1,
      //         religiousAffiliationShow: 1,
      //         levelOfEducation: 1,
      //         levelOfEducationShow: 1,
      //         sexualOrientation: 1,
      //         sexualOrientationShow: 1,
      //         notificationSound: 1,
      //         messageSound: 1,
      //         email: 1,
      //         name: 1,
      //         createdAt: 1,
      //         updatedAt: 1,
      //         lastLogin: 1,
      //         matched: 1,
      //         isSubmit: 1,
      //         questionCount: {
      //           $size: "$questionList",
      //         },
      //         answerCount: {
      //           $size: "$answerList",
      //         },
      //       },
      //     },
      //   ]);

      // let AllUsers = await global.models.GLOBAL.USER.find({
      //   organizationId: ObjectId(organizationId),
      // });

      let AllUsers = await global.models.GLOBAL.USER.aggregate([
        [
          {
            $match: {
              isCompanyVerify: true,
              isCompanyId: {
                $ne: null,
              },
            },
          },
          {
            $lookup: {
              from: "user",
              let: {
                oid: "$isCompanyId",
                uid: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ["$$oid", "$isCompanyId"],
                        },
                      },
                      {
                        $expr: {
                          $ne: ["$$uid", "$_id"],
                        },
                      },
                    ],
                    isCompanyVerify: null,
                  },
                },
              ],
              as: "user",
            },
          },
          {
            $addFields: {
              orgUsers: {
                $size: "$user",
              },
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
        ],
      ]);

      // let AllUsers = await global.models.GLOBAL.USER.find({
      //   isCompanyVerify: true,
      // }).sort({ createdAt: -1 });

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: { users: AllUsers, count: AllUsers.length },
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

    res.status(200).send({
      user: user,
    });
  },
};
