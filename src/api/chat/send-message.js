const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const { ObjectID } = require("mongodb");

// Add chat by user
module.exports = exports = {
  // route validation
  validation: Joi.object({
    roomId: Joi.string().required(),
    message: Joi.string().required(),
  }),
  handler: async (req, res) => {
    const { roomId, sender, message, type, parentMessageId, flag } = req;
    // // console.log("ID-->>", parentMessageId);
    // const { user } = req;

    // console.log("ID-->>", sender);
    const chat_user = await global.models.GLOBAL.CHAT_ROOM.findById(roomId);
    // console.log("chat_user-->>", chat_user.participateIds);
    for (let i = 0; i < chat_user.participateIds.length; i++) {
      if (chat_user.participateIds[i] == sender) {
        chat_user.participateIds.splice(i, 1);
      }
    }
    // console.log("new participentIds-->>", chat_user.participateIds);
    let receiverId = chat_user.participateIds[0];
    const userOnline = await global.models.GLOBAL.USER.findOne({
      _id: ObjectID(receiverId),
      // isOnline: true,
    });
    let isDelivered =
      userOnline === null ? false : userOnline.isOnline ? true : false;
    try {
      let chat = {
        roomId: roomId,
        sender: sender || user._id,
        message: message,
        type: type,
        parentMessageId: parentMessageId,
        createdAt: Date.now(),
        sentTo: [receiverId],
        deliveredTo: isDelivered ? [receiverId] : [],
      };
      if (flag == "seen") {
        chat.seenBy = [receiverId];
      }

      let newMessage = await global.models.GLOBAL.CHAT.create(chat);

      let newChat = await global.models.GLOBAL.CHAT.findOne({
        _id: newMessage._id,
      }).populate({
        path: "parentMessageId",
        model: "chat",
        select: "roomId sender message messageType type createdAt updatedAt",
      });

      let lastMessageObj = {
        messageId: newMessage._id,
        message: newMessage.message,
        createdAt: Date.now(),
      };

      let addLastMessage =
        await global.models.GLOBAL.CHAT_ROOM.findOneAndUpdate(
          {
            _id: roomId,
          },
          { $set: { lastMessage: lastMessageObj } },
          { new: true }
        );
      // // console.log("NEW CHAT---->>", newChat);

      let ntfObj = {
        userId: sender,
        receiverId: receiverId,
        title: `Notification By ${sender} to ${receiverId}`,
        description: {
          data: { title: "Leaderbridge" },
          notification: {
            title: "New Message Request!!!",
            body: `Give you a chat message`,
          },
        },
        createdBy: sender,
        updatedBy: sender,
        createdAt: Date.now(),
      };
      // console.log("currentNotification-->>", ntfObj);

      let notification = await global.models.GLOBAL.NOTIFICATION.create(ntfObj);
      // console.log("NEW CHAT---->>", notification);
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.MESSAGE_SENT,
        payload: { newChat },
        logPayload: false,
      };
      // res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
      return data4createResponseObject;
    } catch (error) {
      // logger.error(`${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`);
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      // res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
      return data4createResponseObject;
    }
  },
};
