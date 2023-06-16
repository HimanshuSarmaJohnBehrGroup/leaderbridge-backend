const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const { getHeaderFromToken } = require("../../utils");
const ObjectId = require("mongodb").ObjectId;
const utils = require("../../utils");

// Retrieve and return all Answer from the database.
module.exports = exports = {
  // route handler
  handler: async ({ user }) => {
    // const { user } = req;
    // const { sent } = req.query;
    // const { received } = req.query;

    const userData = await getHeaderFromToken(user);

    // console.log("userData-------------------datat", userData);
    // // console.log("DDDDDDDDDDDDDDDDDDDffffffffffff-----", userData);
    // // console.log("DDDDDDDDDDDDDDDDDDDffffffffffff-----received", received);
    // // console.log("DDDDDDDDDDDDDDDDDDDffffffffffff-----sent", sent);

    try {
      let findUser = await global.models.GLOBAL.USER.findOne({
        _id: userData.id,
      });
      // let findConnection;
      // let findConnection = await global.models.GLOBAL.CONNECTION.find({
      //   receiverId: userData.id,
      //   senderId: { $nin: findUser.blockUser },
      // })
      //   .populate({
      //     path: "receiverId",
      //     model: "user",
      //     select: "_id name email profileImage region currentRole subject",
      //   })
      //   .populate({
      //     path: "senderId",
      //     model: "user",
      //     select: "_id name email profileImage region currentRole subject",
      //   })
      //   .sort({
      //     requestedAt: -1,
      //   });

      let findConnection = await global.models.GLOBAL.CONNECTION.aggregate([
        {
          $match: {
            receiverId: ObjectId(userData.id),
            senderId: { $nin: findUser.blockUser },
          },
        },

        {
          $lookup: {
            from: "user",
            let: { receiverId: "$receiverId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$receiverId"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  profileImage: 1,
                  region: 1,
                  currentRole: 1,
                  subject: 1,
                },
              },
            ],
            as: "receiverId",
          },
        },

        {
          $lookup: {
            from: "user",
            let: { senderId: "$senderId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$senderId"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  profileImage: 1,
                  region: 1,
                  currentRole: 1,
                  subject: 1,
                },
              },
            ],
            as: "senderId",
          },
        },

        {
          $lookup: {
            from: "verificationStatus",
            let: {
              senderId: "$senderId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $in: ["$userId", "$$senderId._id"],
                      },
                      // { $ne: ["$userId", ObjectId(user.id)] },
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

        { $unwind: "$receiverId" },
        { $unwind: "$senderId" },

        // { $unwind: "$verificationStatus" },

        // {
        //   $unwind: "$senderId",
        // },
        {
          $unwind: "$verificationStatus",
        },
        // {
        //   $addFields: {
        //     "senderId.accept": {
        //       $cond: {
        //         if: {
        //           $eq: ["$senderId._id", "$acceptFilterd"],
        //         },
        //         then: "$verificationStatus.accept",
        //         else: false,
        //       },
        //     },
        //   },
        // },
        {
          $group: {
            _id: "$_id",
            receiverId: {
              $addToSet: "$receiverId",
            },
            senderId: {
              $addToSet: "$senderId",
            },
            message: {
              $addToSet: "$message",
            },

            reason: {
              $addToSet: "$reason",
            },
            requestedAt: {
              $addToSet: "$requestedAt",
            },
            status: {
              $addToSet: "$status",
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
            senderId: 1,
            receiverId: 1,
            message: 1,
            requestedAt: 1,
            reason: 1,
            status: 1,
            _id: 1,
            verificationStatus: 1,
            data: {
              $arrayElemAt: ["$data", 0],
            },
          },
        },
        {
          $project: {
            senderId: 1,
            receiverId: 1,
            verificationStatus: 1,
            message: "$data.message",
            requestedAt: "$data.requestedAt",
            status: "$data.status",
            reason: "$data.reason",

            isActive: "$data.isActive",
            isDeleted: "$data.isDeleted",
            updatedAt: "$data.updatedAt",
            mutedBy: "$data.mutedBy",
            matchingRoom: "$data.matchingRoom",
            createdAt: "$data.createdAt",
            createdBy: "$data.createdBy",
            lastMessage: "$data.lastMessage",
          },
        },

        { $unwind: "$receiverId" },
        { $unwind: "$senderId" },

        // { $unwind: "$verificationStatus" },

        // {
        //   $unwind: "$senderId",
        // },
        // {
        //   $unwind: "$verificationStatus",
        // },
      ]).sort({
        requestedAt: -1,
      });

      const data4createResponseObject = {
        // req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: { findConnection },
        logPayload: false,
      };
      // console.log("Data---------fdggdgdddddddddddd", data4createResponseObject);
      return data4createResponseObject;

      // res
      //   .status(enums.HTTP_CODES.OK)
      //   .json(utils.createResponseObject(data4createResponseObject));
    } catch (error) {
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };

      return data4createResponseObject;
    }
  },
};
