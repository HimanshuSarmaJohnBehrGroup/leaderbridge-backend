const { ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const { getHeaderFromToken } = require("../../utils");
const utils = require("../../utils");

// Retrieve and return all Answer from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    // const useData = await utils.getUserData(user);
    // // console.log(user, "useerData");
    const userData = await getHeaderFromToken(user);
    // console.log("userDataxxxx", userData);
    // try {
    let findUser = await global.models.GLOBAL.USER.findOne({
      _id: userData.id,
    });

    let findConnection = await global.models.GLOBAL.USER.aggregate([
      {
        $match: {
          _id: new ObjectId(userData.id),
        },
      },
      {
        $unwind: {
          path: "$accepted",
        },
      },
      {
        $match: {
          "accepted._id": {
            $nin: findUser.blockUser,
          },
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "accepted._id",
          foreignField: "_id",
          as: "accepted",
          let: {
            accepted: "$accepted.unknownName",
            createdAt: "$accepted.createdAt",
          },
          pipeline: [
            {
              $addFields: {
                uniqueName: "$$accepted",
                uniqueCreateAt: "$$createdAt",
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$accepted",
        },
      },
      {
        $group: {
          _id: "_id",
          accepted: {
            $push: "$accepted",
          },
        },
      },
      {
        $lookup: {
          from: "verificationStatus",
          let: {
            accepted: "$accepted",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$userId", "$$accepted._id"],
                    },
                    {
                      $ne: ["$userId", new ObjectId(userData.id)],
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
        $addFields: {
          acceptFilter: "$verificationStatus.userId",
        },
      },
      {
        $unwind: "$accepted",
      },
      {
        $unwind: "$verificationStatus",
      },
      {
        $addFields: {
          acceptFilter: "$verificationStatus.userId",
        },
      },
      {
        $addFields: {
          "accepted.accept": {
            $cond: {
              if: {
                $eq: ["$accepted._id", "$acceptFilter"],
              },
              then: "$verificationStatus.accept",
              else: false,
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          accepted: {
            $addToSet: "$accepted",
          },
          verificationStatus: {
            $addToSet: "$verificationStatus",
          },
          data: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $project: {
          accepted: 1,
          verificationStatus: 1,
          data: {
            $arrayElemAt: ["$data", 0],
          },
        },
      },
      {
        $project: {
          accepted: 1,
          uniqueName: "$data.accepted.unknownName",
          verificationStatus: 1,
          message: "$data.message",
          requestedAt: "$data.requestedAt",
          status: "$data.status",
          isActive: "$data.isActive",
          isDeleted: "$data.isDeleted",
          updatedAt: "$data.updatedAt",
          mutedBy: "$data.mutedBy",
          matchingRoom: "$data.matchingRoom",
          createdAt: "$data.uniqueCreateAt",
          createdBy: "$data.createdBy",
          lastMessage: "$data.lastMessage",
        },
      },
      {
        $unwind: {
          path: "$accepted",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$accepted._id",
          uniqueName: {
            $first: "$accepted.uniqueName",
          },
          verificationStatus: {
            $first: "$accepted.verificationStatus",
          },
          requestedAt: {
            $first: "$accepted.requestedAt",
          },
          status: {
            $first: "$accepted.status",
          },
          isActive: {
            $first: "$accepted.isActive",
          },
          subject: {
            $first: "$accepted.subject",
          },
          region: {
            $first: "$accepted.region",
          },
          uniqueCreateAt: {
            $first: "$accepted.uniqueCreateAt",
          },
          profileImage: {
            $first: "$accepted.profileImage",
          },
        },
      },
      {
        $sort: {
          uniqueCreateAt: -1,
        },
      },
    ]);

    // let findConnection = await global.models.GLOBAL.USER.aggregate([
    //   {
    //     $match: {
    //       _id: ObjectId(userData.id),
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$accepted",
    //     },
    //   },
    //   {
    //     $match: {
    //       accepted: {
    //         $nin: findUser.blockUser,
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "user",
    //       localField: "accepted",
    //       foreignField: "_id",
    //       as: "accepted",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$accepted",
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "_id",
    //       accepted: {
    //         $push: "$accepted",
    //       },
    //     },
    //   },
    // ]);

    // findConnection = JSON.parse(JSON.stringify(findConnection));

    // console.log("findAcceptedBlockedUser", findConnection);

    const data4createResponseObject = {
      // req: req,
      result: 0,
      message: messages.SUCCESS,
      payload: {
        connection: findConnection,
      },
      logPayload: false,
    };
    // // console.log("qqwwqqwwqqww", findConnection[0].accepted);
    // res
    //   .status(enums.HTTP_CODES.OK)
    //   .json(utils.createResponseObject(data4createResponseObject));
    return data4createResponseObject;
    // return data4createResponseObject;
    // } catch (error) {
    //   // logger.error(
    //   //   `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
    //   // );

    //   const data4createResponseObject = {
    //     // req: req,
    //     result: -1,
    //     message: messages.GENERAL,
    //     payload: {},
    //     logPayload: false,
    //   };

    //   return data4createResponseObject;
    //   // res
    //   //   .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
    //   //   .json(utils.createResponseObject(data4createResponseObject));
    // }
  },
};
