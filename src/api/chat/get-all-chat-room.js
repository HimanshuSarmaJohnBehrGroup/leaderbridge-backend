const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const ObjectId = require("mongodb").ObjectId;

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    // try {
    let user = await utils.getHeaderFromToken(req.user);
    let chatRoom = [];

    // chatRoom = await global.models.GLOBAL.CHAT_ROOM.find({
    //   participateIds: { $in: [user.id] },
    // })
    //   .populate({
    //     path: "participateIds",
    //     model: "user",
    //     match: {
    //       _id: { $ne: user.id },
    //     },
    //     select:
    //       "_id name subject profileImage currentRole email blockUser isOnline",
    //   })
    //   .lean();

    // chatRoom = await global.models.GLOBAL.CHAT_ROOM.aggregate([
    //   {
    //     $match: {
    //       participateIds: { $in: [ObjectId(user.id)] },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "user",
    //       let: { participateIds: "$participateIds" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 { $in: ["$_id", "$$participateIds"] },
    //                 { $ne: ["$_id", ObjectId(user.id)] },
    //               ],
    //             },
    //           },
    //         },
    //         {
    //           $project: {
    //             _id: 1,
    //             name: 1,
    //             subject: 1,
    //             profileImage: 1,
    //             currentRole: 1,
    //             email: 1,
    //             blockUser: 1,
    //             isOnline: 1,
    //           },
    //         },
    //       ],
    //       as: "participateIds",
    //     },
    //   },

    //   {
    //     $lookup: {
    //       from: "verificationStatus",
    //       let: { participateIds: "$participateIds" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 { $in: ["$userId", "$$participateIds._id"] },
    //                 { $ne: ["$userId", ObjectId(user.id)] },
    //               ],
    //             },
    //           },
    //         },
    //       ],
    //       as: "verificationStatus",
    //     },
    //   },

    //   // { $unwind: "$participateIds" },

    //   // {},

    //   // {
    //   //   $group: {
    //   //     _id: "$_id",
    //   //     participateIds: { $first: "$participateIds" },
    //   //     verificationStatus: { $first: "$verificationStatus" },
    //   //     lastMessage: { $first: "$lastMessage" },
    //   //     lastMessageTime: { $first: "$lastMessageTime" },
    //   //     createdAt: { $first: "$createdAt" },
    //   //     updatedAt: { $first: "$updatedAt" },
    //   //   },
    //   // },
    // ]);

    chatRoom = await global.models.GLOBAL.CHAT_ROOM.aggregate([
      {
        $match: {
          participateIds: { $in: [ObjectId(user.id)] },
        },
      },
      {
        $lookup: {
          from: "user",
          let: {
            participateIds: "$participateIds",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$_id", "$$participateIds"],
                    },
                    { $ne: ["$_id", ObjectId(user.id)] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                subject: 1,
                profileImage: 1,
                currentRole: 1,
                email: 1,
                blockUser: 1,
                isOnline: 1,
                unknownName: 1,
              },
            },
          ],
          as: "participateIds",
        },
      },

      {
        $lookup: {
          from: "user",
          let: {
            userID: ObjectId(user.id),
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$userID"],
                    },
                  ],
                },
              },
            },

            {
              $project: {
                _id: 1,
                name: 1,
                subject: 1,
                profileImage: 1,
                currentRole: 1,
                email: 1,
                accepted: 1,
                blockUser: 1,
                isOnline: 1,
                unknownName: 1,
              },
            },
          ],
          as: "acceptedUser",
        },
      },

      {
        $lookup: {
          from: "verificationStatus",
          let: {
            participateIds: "$participateIds",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$userId", "$$participateIds._id"],
                    },
                    { $ne: ["$userId", ObjectId(user.id)] },
                  ],
                },
              },
            },
          ],
          as: "verificationStatus",
        },
      },
      {
        $unwind: "$acceptedUser",
      },

      {
        $unwind: "$acceptedUser.accepted",
      },

      {
        $unwind: "$participateIds",
      },
      {
        $unwind: "$verificationStatus",
      },
      {
        $addFields: {
          "participateIds.accept": {
            $cond: {
              if: {
                $eq: ["$participateIds._id", "$verificationStatus.userId"],
              },
              then: "$verificationStatus.accept",
              else: false,
            },
          },
        },
      },

      {
        $addFields: {
          "participateIds.unknownName": {
            $cond: {
              if: {
                $eq: ["$participateIds._id", "$acceptedUser.accepted._id"],
              },
              then: "$acceptedUser.accepted.unknownName",
              else: false,
            },
          },
        },
      },

      {
        $addFields: {
          isRight: {
            $cond: {
              if: {
                $eq: ["$participateIds._id", "$acceptedUser.accepted._id"],
              },
              then: true,
              else: false,
            },
          },
        },
      },

      {
        $match: {
          isRight: true,
        },
      },

      {
        $group: {
          _id: "$_id",
          participateIds: {
            $push: "$participateIds",
          },
          verificationStatus: {
            $push: "$verificationStatus",
          },
          data: {
            $push: "$$ROOT",
          },
        },
      },

      {
        $project: {
          participateIds: 1,
          verificationStatus: 1,
          data: {
            $arrayElemAt: ["$data", 0],
          },
        },
      },
      {
        $project: {
          participateIds: 1,
          verificationStatus: 1,
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
    ]);

    for (let i = 0; i < chatRoom.length; i++) {
      let unseenMessageCount = 0;
      let chat = await global.models.GLOBAL.CHAT.find({
        roomId: chatRoom[i]._id,
      });

      for (let j = 0; j < chat.length; j++) {
        if (`${chat[j]?.sender}` != user.id) {
          if (`${chat[j]?.seenBy[0]}` != user.id) {
            // if (chat[j].seenBy.indexOf(user.id) === -1) {
            // if (chat[j]?.seenBy.length == 0) {
            unseenMessageCount++;
            // }
          }
        }
      }

      chatRoom[i] = JSON.parse(JSON.stringify(chatRoom[i]));
      chatRoom[i].unseenMessageCount = unseenMessageCount;
    }

    chatRoom?.sort(function (a, b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return (
        new Date(b?.lastMessage?.createdAt) -
        new Date(a?.lastMessage?.createdAt)
      );
    });

    const data4createResponseObject = {
      req: req,
      result: 0,
      message: messages.SUCCESS,
      payload: { room: chatRoom },
      logPayload: false,
    };

    return data4createResponseObject;
    // } catch (error) {
    //   const data4createResponseObject = {
    //     req: req,
    //     result: -1,
    //     message: messages.GENERAL,
    //     payload: {},
    //     logPayload: false,
    //   };
    //   return data4createResponseObject;
    // }
  },
};
