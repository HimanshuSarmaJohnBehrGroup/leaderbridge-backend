const { ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Category from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { userData, userId } = req.query;

    let critaria = {};
    if (userData) {
      critaria = {
        userId: ObjectId(user._id),
        status: true,

        // "options.$.status": true,

        $and: [
          // { filterId: { $ne: ObjectId("619e0b3e641d2f00f887ec9b") } },
          // { filterId: { $ne: ObjectId("63622d77abfdaa1f6a911c51") } },
          { required: false },

          {
            options: {
              $ne: [],
            },
          },
        ],
      };
    } else {
      if (userId) {
        critaria = {
          userId: ObjectId(userId),
          required: false,
          status: true,
          $and: [
            {
              options: {
                $ne: [],
              },
            },
            { displayProfile: true },
          ],
        };
      } else {
        critaria = { userId: user._id, profileHide: false };
      }
    }

    console.log("SSSSSSSSSSSSSSSSWWWW", critaria);
    try {
      let filterType;
      if (userData || userId) {
        filterType = await global.models.GLOBAL.USER_FILTER.aggregate([
          {
            $match: critaria,
          },

          {
            $unwind: {
              path: "$options",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              "options.status": true,
            },
          },
          {
            $group: {
              _id: "$_id",
              options: {
                $push: "$options",
              },
              filterTypeId: {
                $first: "$filterTypeId",
              },
              name: {
                $first: "$name",
              },
              multiSelect: {
                $first: "$multiSelect",
              },

              profileHide: {
                $first: "$profileHide",
              },
              required: {
                $first: "$required",
              },

              orders: {
                $first: "$orders",
              },

              status: {
                $first: "$status",
              },

              userId: {
                $first: "$userId",
              },

              displayProfile: {
                $first: "$displayProfile",
              },

              createdAt: {
                $first: "$createdAt",
              },
              updatedAt: {
                $first: "$updatedAt",
              },
              displayProfile: {
                $first: "$displayProfile",
              },
            },
          },

          { $sort: { orders: 1 } },
        ]);
      } else {
        filterType = await global.models.GLOBAL.USER_FILTER.find({
          ...critaria,
        }).sort({ orders: 1 });
      }

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: { filterType },
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
