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
      let AllUsers = await global.models.GLOBAL.USER.aggregate([
        [
          {
            $match: {
              isOrganization: true,
              OrgRanDomID: {
                $ne: null,
              },
            },
          },
          {
            $lookup: {
              from: "user",
              let: {
                oid: "$OrgRanDomID",
                uid: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ["$$oid", "$OrgRanDomID"],
                        },
                      },
                      {
                        $expr: {
                          $ne: ["$$uid", "$_id"],
                        },
                      },
                    ],
                    isOrganization: false,
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
