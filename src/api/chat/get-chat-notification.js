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
    chatRoom = await global.models.GLOBAL.CHAT_ROOM.find({
      participateIds: { $in: [user.id] },
    })
      .populate({
        path: "participateIds",
        model: "user",
        match: {
          _id: { $ne: user.id },
        },
        select:
          "_id name subject profileImage currentRole email blockUser isOnline",
      })
      .lean();

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
      chatRoom[i].unseenMessageCount = unseenMessageCount;
    }

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
