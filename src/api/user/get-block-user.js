const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const { getHeaderFromToken } = require("../../utils");
const utils = require("../../utils");
const { ObjectId } = require("mongodb");
// Retrieve and return all Block-user List from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const userData = await getHeaderFromToken(user);
    // try {
    req.query.page = req.query.page ? req.query.page : 1;
    let page = parseInt(req.query.page);
    req.query.limit = req.query.limit ? req.query.limit : 10;
    let limit = parseInt(req.query.limit);
    let skip = (parseInt(req.query.page) - 1) * limit;
    // let blockUser = await global.models.GLOBAL.USER.find({
    //   _id: userData.id,
    // })
    //   .populate({
    //     path: "blockUser",
    //     model: "user",
    //     select: "_id email name currentRole subject profileImage",
    //   })
    //   .skip(skip)
    //   .limit(limit);

    let blockUser = await global.models.GLOBAL.USER.aggregate([
      {
        $match: {
          _id: new ObjectId(userData.id),
        },
      },
      {
        $lookup: {
          from: "user",
          let: {
            blockUser: "$blockUser",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$blockUser"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                email: 1,
                name: 1,
                currentRole: 1,
                subject: 1,
                profileImage: 1,
              },
            },
          ],
          as: "blockUser",
        },
      },
      {
        $lookup: {
          from: "verificationStatus",
          let: {
            blockUser: "$blockUser",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$userId", "$$blockUser._id"],
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
        $unwind: "$blockUser",
      },
      {
        $addFields: {
          "blockUser.accept": {
            $cond: {
              if: {
                $eq: ["$blockUser._id", "$acceptFilter"],
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
          blockUser: {
            $addToSet: "$blockUser",
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
          blockUser: 1,
          verificationStatus: 1,
          data: {
            $arrayElemAt: ["$data", 0],
          },
        },
      },
      {
        $project: {
          blockUser: 1,
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

    if (blockUser) {
      blockUser = JSON.parse(JSON.stringify(blockUser));
      const data4createResponseObject = {
        // req: req,
        result: 0,
        message: messages.ITEM_FETCHED,
        payload: {
          blockUser: blockUser[0]?.blockUser,
          count: blockUser[0]?.blockUser.length,
          page,
          limit,
        },
        logPayload: false,
      };
      return data4createResponseObject;
      // res
      //   .status(enums.HTTP_CODES.OK)
      //   .json(utils.createResponseObject(data4createResponseObject));
    } else {
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.NOT_FOUND,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
      // res
      //   .status(enums.HTTP_CODES.NOT_FOUND)
      //   .json(utils.createResponseObject(data4createResponseObject));
    }
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
