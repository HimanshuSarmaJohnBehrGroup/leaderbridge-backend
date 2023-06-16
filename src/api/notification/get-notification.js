const { ObjectID } = require("bson");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const { getHeaderFromToken } = require("../../utils");
const utils = require("../../utils");
const ObjectId = require("mongodb").ObjectId;

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  // route handler
  handler: async (req) => {
    const { user, status } = req;

    let notification = [];
    const userData = await getHeaderFromToken(user);
    // console.log("userDa------------------", userData);

    let updateNotification = await global.models.GLOBAL.NOTIFICATION.updateMany(
      { receiverId: userData.id },
      {
        $set: {
          status: false,
        },
      },
      { new: true }
    );
    // console.log("updateNotificationnnn----------", updateNotification);

    try {
      let getNotification = await global.models.GLOBAL.NOTIFICATION.aggregate([
        {
          $match: {
            receiverId: ObjectId(userData.id),
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
          $lookup: {
            from: "question",
            localField: "question",
            foreignField: "_id",
            as: "question",
          },
        },
        {
          $unwind: {
            path: "$question",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      // console.log("getNotification", getNotification.length);

      // console.log("I-----------------Am", status);

      const data4createResponseObject = {
        // req: req,
        result: 0,
        message: messages.ITEM_FETCHED,
        payload: { notification: getNotification },
        logPayload: false,
      };
      // return res
      //   .status(enums.HTTP_CODES.OK)
      //   .json(utils.createResponseObject(data4createResponseObject));
      return data4createResponseObject;
    } catch (error) {
      logger.error(
        `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
      );
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      // return res
      //   .status(enums.HTTP_CODES.BAD_REQUEST)
      //   .json(utils.createResponseObject(data4createResponseObject));
      return data4createResponseObject;
    }
  },
};
