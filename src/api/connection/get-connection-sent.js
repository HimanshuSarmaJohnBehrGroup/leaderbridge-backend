const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const { getHeaderFromToken } = require("../../utils");
const utils = require("../../utils");
const ObjectId = require("mongodb").ObjectId;

// Retrieve and return all Answer from the database.
module.exports = exports = {
  // route handler
  handler: async ({ user }) => {
    // const { user } = req;
    // const { sent } = req.query;
    // const { received } = req.query;

    const userData = await getHeaderFromToken(user);

    // console.log("userData-------------------datat", userData);

    try {
      // let findConnection;

      let findUser = await global.models.GLOBAL.USER.findOne({
        _id: userData.id,
      });

      // let findConnection = await global.models.GLOBAL.CONNECTION.find({
      //   senderId: userData.id,
      //   receiverId: { $nin: findUser.blockUser },
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
            senderId: ObjectId(userData.id),
            receiverId: { $nin: findUser.blockUser },
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
              receiverId: "$receiverId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $in: ["$userId", "$$receiverId._id"],
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
        {
          $addFields: {
            "receiverId.accept": {
              $cond: {
                if: {
                  $eq: ["$receiverId._id", "$acceptFilter"],
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
            receiverId: {
              $addToSet: "$receiverId",
            },
            senderId: {
              $addToSet: "$senderId",
            },
            message: {
              $addToSet: "$message",
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
      // console.log("Data---------", data4createResponseObject);
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
