const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const ObjectId = require("mongodb").ObjectId;
const utils = require("../../utils");

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res, f) => {
    // const { roomId } = req;
    let user = await utils.getHeaderFromToken(res);
    try {
      // if (f == "user") {
      //   let findRoom = await global.models.GLOBAL.CHAT_ROOM.findOne({
      //     _id: req,
      //   }).populate({
      //     path: "participateIds",
      //     model: "user",
      //     match: {
      //       _id: { $ne: user.id },
      //     },
      //     select: "_id name subject profileImage currentRole email blockUser ",
      //   });
      //   let updateRChat = await global.models.GLOBAL.CHAT.updateMany(
      //     {
      //       sentTo: findRoom.participateIds[0]._id,
      //       roomId: ObjectId(req),
      //     },
      //     { $addToSet: { seenBy: findRoom.participateIds[0]._id } }
      //   );
      //   console.log(
      //     "findRoom-------------------vvv",
      //     findRoom.participateIds[0]._id,
      //     req
      //   );
      //   let updateChat = await global.models.GLOBAL.CHAT.updateMany(
      //     { sentTo: ObjectId(user.id), roomId: ObjectId(req) },
      //     { $addToSet: { seenBy: ObjectId(user.id) } }
      //   );
      // } else {
      let updateChat = await global.models.GLOBAL.CHAT.updateMany(
        { sentTo: ObjectId(user.id), roomId: ObjectId(req) },
        { $addToSet: { seenBy: ObjectId(user.id) } }
      );
      // }

      let chats = await global.models.GLOBAL.CHAT.find({
        roomId: req,
      }).populate({
        path: "parentMessageId",
        model: "chat",
        select:
          "roomId sender message messageType type createdAt updatedAt sentTo deliveredTo",
      });

      // console.log("CHAT-->kkkkk", chats);
      if (chats) {
        let findRoom = await global.models.GLOBAL.CHAT_ROOM.findOne({
          _id: req,
        }).populate({
          path: "participateIds",
          model: "user",
          match: {
            _id: { $ne: user.id },
          },
          select: "_id name subject profileImage currentRole email blockUser ",
        });

        // console.log("findRoom--->----------------------", findRoom);
        // // console.log("ROOM--->>", findRoom.participateIds[0]._id);
        // // console.log("USER--->>", user.id);

        // let findRequest =
        //   await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
        //     $and: [
        //       { requestBy: user.id },
        //       { requestTo: findRoom.participateIds[0]._id },
        //     ],
        //   }).populate({
        //     path: "requestBy",
        //     model: "user",
        //     select:
        //       "_id name email region currentRole subject profileImage countryOfResidence",
        //   });
        // let receivedRequest =
        //   await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
        //     $and: [
        //       { requestBy: findRoom.participateIds[0]._id },
        //       { requestTo: user.id },
        //     ],
        //   }).populate({
        //     path: "requestTo",
        //     model: "user",""""
        //     select:
        //       "_id name email region currentRole subject profileImage countryOfResidence",
        //   });

        let request = await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
          roomId: ObjectId(req),
          typeOfRequest: "requestProfileAccess",
          // requestBy: ObjectId(user.id),
        })
          .populate({
            path: "requestTo",
            model: "user",
            select:
              "_id name email region currentRole subject profileImage countryOfResidence",
          })
          .populate({
            path: "requestBy",
            model: "user",
            select:
              "_id name email region currentRole subject profileImage countryOfResidence",
          });
        let requestAudio =
          await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
            roomId: ObjectId(req),
            typeOfRequest: "requestAudioAccess",
            // requestBy: ObjectId(user.id),
          })
            .populate({
              path: "requestTo",
              model: "user",
              select:
                "_id name email region currentRole subject profileImage countryOfResidence",
            })
            .populate({
              path: "requestBy",
              model: "user",
              select:
                "_id name email region currentRole subject profileImage countryOfResidence",
            });
        let requestVideo =
          await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
            roomId: ObjectId(req),
            typeOfRequest: "requestVideoAccess",
            // requestBy: ObjectId(user.id),
          })
            .populate({
              path: "requestTo",
              model: "user",
              select:
                "_id name email region currentRole subject profileImage countryOfResidence",
            })
            .populate({
              path: "requestBy",
              model: "user",
              select:
                "_id name email region currentRole subject profileImage countryOfResidence",
            });
        // console.log("requestAudio----------->", requestAudio);
        // console.log("requestVideo----------->", requestVideo);

        // console.log("request------------------------>", request);
        let checkBlockByMe = await global.models.GLOBAL.USER.findOne({
          $and: [
            {
              _id: user.id,
            },
            { blockUser: { $in: [findRoom.participateIds[0]._id] } },
          ],
        });
        let checkBlockByOther = await global.models.GLOBAL.USER.findOne({
          $and: [
            { _id: findRoom.participateIds[0]._id },
            { blockUser: { $in: [user.id] } },
          ],
        });

        // console.log("findRequest--->", user.id);
        // console.log("findRequest=========--->", findRoom.participateIds[0]._id);

        const isFriend = await global.models.GLOBAL.USER.findOne({
          _id: user.id,
          accepted: findRoom.participateIds[0]._id,
        });

        // console.log("isFriend------", isFriend);
        if (checkBlockByMe) {
          // console.log("By Me--->");
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: {
              chats: chats,
              request: request,
              requestAudio: requestAudio,
              requestVideo: requestVideo,
              isFriend: isFriend == null ? false : true,

              text: "You are blocked this user, if you want to unblock this user, please go to setting and unblock this user.",
            },
            logPayload: false,
          };
          return data4createResponseObject;
        } else if (checkBlockByOther) {
          // console.log("By Other--->");

          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: {
              chats: chats,
              request: request,
              requestAudio: requestAudio,
              requestVideo: requestVideo,
              text: "You are blocked by this user.",
              isFriend: isFriend == null ? false : true,
            },
            logPayload: false,
          };
          return data4createResponseObject;
        } else {
          // console.log("<------------>");

          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: {
              chats: chats,
              request: request,
              requestAudio: requestAudio,
              requestVideo: requestVideo,
              text: null,
              isFriend: isFriend == null ? false : true,
            },
            logPayload: false,
          };
          return data4createResponseObject;
        }
      }
    } catch (error) {
      // logger.error(`${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`);
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      // res.status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(utils.createResponseObject(data4createResponseObject));
      return data4createResponseObject;
    }
  },
};
