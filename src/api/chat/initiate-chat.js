const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const ObjectId = require("mongodb").ObjectId;

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  //  route validation
  validation: Joi.object({
    id: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    try {
      const { id } = req.body;
      const { user } = req;

      // console.log("participateIds===================");
      let participateIds = [];
      // check user type
      participateIds.push(user._id);
      participateIds.push(id);
      let chatRoom = await global.models.GLOBAL.CHAT_ROOM.findOne({
        $and: [
          {
            participateIds: {
              $size: participateIds.length,
              $all: [...participateIds],
            },
          },
          { matchingRoom: false },
        ],
      });
      // console.log("chatRoom-->>", chatRoom);
      const roomExist = await global.models.GLOBAL.CHAT_ROOM.findOne({
        $and: [
          {
            participateIds: {
              $size: participateIds.length,
              $all: [...participateIds],
            },
          },
          { matchingRoom: true },
        ],
      });
      // console.log("roomExist-->>", roomExist);
      if (chatRoom) {
        let checkBlockByMe = await global.models.GLOBAL.USER.findOne({
          $and: [
            {
              _id: user._id,
            },
            { blockUser: { $in: [id] } },
          ],
        });
        let checkBlockByOther = await global.models.GLOBAL.USER.findOne({
          $and: [{ _id: id }, { blockUser: { $in: [user._id] } }],
        });
        if (checkBlockByMe) {
          let text =
            "You are blocked this user, if you want to unblock this user, please go to setting and unblock this user.";
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.INITIATION_SUCCESS,
            payload: { chatRoom, text },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.NOT_ACCEPTABLE)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (checkBlockByOther) {
          let text = "You are blocked by this user.";
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.INITIATION_SUCCESS,
            payload: { chatRoom, text },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.NOT_ACCEPTABLE)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.INITIATION_SUCCESS,
            payload: { chatRoom },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else {
        chatRoom = await global.models.GLOBAL.CHAT_ROOM.create({
          participateIds: participateIds,
          createdAt: Date.now(),
          createdBy: user._id,
        });
        // console.log("chatRoom-->>create", chatRoom);

        let checkBlockByMe = await global.models.GLOBAL.USER.findOne({
          $and: [
            {
              _id: user._id,
            },
            { blockUser: { $in: [id] } },
          ],
        });
        let checkBlockByOther = await global.models.GLOBAL.USER.findOne({
          $and: [{ _id: id }, { blockUser: { $in: [user._id] } }],
        });
        if (checkBlockByMe) {
          let text =
            "You are blocked this user, if you want to unblock this user, please go to setting and unblock this user.";
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.INITIATION_FAILED,
            payload: { chatRoom, text },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.NOT_ACCEPTABLE)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (checkBlockByOther) {
          let text = "You are blocked by this user.";
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.INITIATION_SUCCESS,
            payload: { chatRoom, text },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.NOT_ACCEPTABLE)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.INITIATION_SUCCESS,
            payload: { chatRoom },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      }
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
