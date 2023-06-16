const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const { ObjectId } = require("mongodb");

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    try {
      let { user } = req;
      let { roomId, isGroup } = req.params;

      if (!roomId) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: "Room Id is required",
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.BAD_REQUEST)
          .json(utils.createResponseObject(data4createResponseObject));
      }

      console.log("AAAAAAAAAQQQQQQQQWWWWWWWWWW", isGroup);
      let findRoom;
      if (isGroup) {
        findRoom = await global.models.GLOBAL.ANSWER_GROUP.findOne({
          _id: roomId,
        });
      } else {
        findRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
          _id: roomId,
        });
      }

      console.log("SQQQQQQQQQQQ", findRoom);

      let findAnswer = await global.models.GLOBAL.ANSWER.aggregate([
        {
          $match: {
            roomId: new ObjectId(roomId),
            isStar: true,
          },
        },

        {
          $lookup: {
            from: "user",
            let: {
              createdBy: "$createdBy",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$createdBy"],
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
                  countryOfResidence: 1,
                },
              },
            ],
            as: "createdBy",
          },
        },
        {
          $unwind: {
            path: "$createdBy",
          },
        },

        {
          $sort: {
            createdAt: -1,
          },
        },

        // {
        //   $skip: skip,
        // },

        // {
        //   $limit: limit,
        // },
      ]);

      const data4createResponseObject = {
        req: req,
        result: 1,
        message: "Answer found",
        payload: {
          findAnswer,
          count: findAnswer.length,
        },
        logPayload: false,
      };
      return res
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
