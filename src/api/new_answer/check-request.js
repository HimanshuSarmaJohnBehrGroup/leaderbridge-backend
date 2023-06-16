const { ObjectId, ObjectID } = require("mongodb");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    // const { user } = req;
    const { roomId, receiverId, isGroup, questionId, answerId } = req;
    const user = await utils.getHeaderFromToken(req.user);

    console.log("DDDDDDDDDDDDDDDDDDDD", receiverId, user.id);
    let findRoom;

    if (isGroup) {
      findRoom = await global.models.GLOBAL.ANSWER_GROUP.findOne({
        _id: ObjectId(roomId),
      });
    } else {
      findRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
        _id: ObjectId(roomId),
      });
    }

    if (!findRoom) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
    }

    let RoomId = {
      questionId: ObjectId(questionId),
    };

    let FindQuestion = await global.models.GLOBAL.QUESTION.findOne({
      _id: ObjectId(questionId),
    });

    let FindUserRecivered = await global.models.GLOBAL.USER.findOne({
      _id: ObjectId(receiverId),
    });

    let findAnswer1 = await global.models.GLOBAL.ANSWER.find({
      roomId: roomId,
      createdBy: receiverId == FindQuestion?.createdBy ? user.id : receiverId,
    });

    let findAnswer2 = await global.models.GLOBAL.ANSWER.find({
      roomId: roomId,
      // createdBy: ObjectId("636b74617a3ce63a87b81331") ,
      createdBy: FindQuestion?.createdBy,
    });

    console.log(
      "SSSSSSSSSSSSAAAAAAAAAAA",
      findAnswer1.length,
      findAnswer2.length
    );

    let CheckConnection =
      findAnswer1 &&
      findAnswer1.length > 0 &&
      findAnswer2 &&
      findAnswer2.length > 0
        ? false
        : true;

    console.log(
      "AAQQQQQQQQQQQQ",
      CheckConnection,
      receiverId,
      FindQuestion?.createdBy
    );

    // if (isGroup) {
    //   RoomId = {
    //     roomId: ObjectId(roomId),
    //   };
    // }

    let findRequest = await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
      ...RoomId,
      typeOfRequest: "requestProfileAccess",

      $or: [
        {
          requestBy: ObjectId(user.id),
          requestTo: ObjectId(receiverId),
        },
        {
          requestBy: ObjectId(receiverId),
          requestTo: ObjectId(user.id),
        },
      ],
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
      })
      .sort({ createdAt: -1 });

    let findPrivateRequest =
      await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.find({
        ...RoomId,
        typeOfRequest: "privateChatRequest",

        $or: [
          {
            requestBy: ObjectId(user.id),
            requestTo: ObjectId(receiverId),
          },
          {
            requestBy: ObjectId(receiverId),
            requestTo: ObjectId(user.id),
          },
        ],
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
        })
        .sort({ createdAt: -1 });

    let checkFriend = await global.models.GLOBAL.USER.findOne({
      $and: [
        {
          _id: user.id,
          "accepted._id": {
            $in: [receiverId],
          },
        },
      ],
    });

    console.log("QQQQQQQQQ", receiverId, user.id);

    let CheckRequest = await findRequest[0];
    let requestPrivate = await findPrivateRequest[0];

    let Request = {};
    let PrivateRequest = {};
    let Connections = {};
    let findUser = await global.models.GLOBAL.USER.findOne({
      _id: user.id,
    });

    let findAnswer = await global.models.GLOBAL.ANSWER.findOne({
      _id: answerId,
    });

    // Pending Connection
    // let pandingConnection = await global.models.GLOBAL.CONNECTION.find({
    //   receiverId: user.id,
    // });
    let findConection = await global.models.GLOBAL.CONNECTION.findOne({
      senderId: user.id,
      receiverId: receiverId,
    });

    // const sentIdExist = (id) => {
    //   let check = findConection.filter(function (elc) {
    //     return elc.receiverId.toString() === id.toString();
    //   });
    //   return check.length;
    // };

    const conectIdExist = (id) => {
      return findUser.accepted.length
        ? findUser.accepted.some(function (el) {
            return el._id.toString() == id.toString();
          })
        : false;
    };

    // Request

    if (findAnswer?.displayProfile && answerId) {
      Request = {
        type: "Viewprofile",
        text: "View profile",
      };
    } else {
      console.log("AAAAAAAAAAAAAFFFFFFFFFFFFF");
      if (FindQuestion?.createdBy == user.id) {
        console.log("VIVIVIVIIVIVIVIVVI1");
        if (FindUserRecivered?.displayProfile) {
          Request = {
            type: "Viewprofile",
            text: "View profile",
          };
        } else {
          console.log("DDDDDDDDDDDDDDDDDDD", CheckRequest);
          if (CheckRequest) {
            if (CheckRequest?.status != "accepted") {
              console.log("DDDDDDDDDDDDDDDDDDgfgfhgfhfg");
              if (
                CheckRequest?.requestBy?._id == user.id &&
                CheckRequest?.status == "pending"
                //  &&
                // !checkFriend
              ) {
                Request = {
                  requestBy: user.id,
                  requestTo: receiverId,
                  roomId: roomId,
                  status: "pending",
                  createdAt: CheckRequest.createdAt,
                  updatedAt: CheckRequest.updatedAt,
                  type: "Requested",
                  text: "Requested profile access",
                };
              } else if (
                CheckRequest?.requestBy?._id != user.id &&
                CheckRequest?.status === "pending"
                //  &&
                // !checkFriend
              ) {
                Request = {
                  requestBy: receiverId,
                  requestTo: user.id,
                  roomId: roomId,
                  status: "pending",
                  createdAt: CheckRequest.createdAt,
                  updatedAt: CheckRequest.updatedAt,
                  type: "Received",
                  text: "Profile Access Allowed",
                };
              } else if (
                CheckRequest?.status === "decline"
                //  &&
                //  !checkFriend
              ) {
                Request = {
                  requestBy: user.id,
                  requestTo: receiverId,
                  roomId: roomId,
                  status: "decline",
                  createdAt: CheckRequest.createdAt,
                  updatedAt: CheckRequest.updatedAt,
                  type: "Request",
                  text: "Request profile access",
                };
              }
              // else if (checkFriend) {
              //   Request = {
              //     requestBy: user.id,
              //     requestTo: receiverId,
              //     roomId: roomId,
              //     status: "accepted",
              //     createdAt: CheckRequest.createdAt,
              //     updatedAt: CheckRequest.updatedAt,
              //     type: "Viewprofile",
              //     text: "View profile",
              //   };
              // }
            } else if (
              CheckRequest?.status == "accepted"
              // && !checkFriend
            ) {
              if (CheckRequest?.acceptedBy != user.id) {
                Request = {
                  requestBy: user.id,
                  requestTo: receiverId,
                  roomId: roomId,
                  status: "accepted",
                  createdAt: CheckRequest.createdAt,
                  updatedAt: CheckRequest.updatedAt,
                  type: "Viewprofile",
                  text: "View profile",
                };
              } else {
                Request = {
                  type: "Request",
                  text: "Request profile access",
                };
              }
            } else if (
              requestedBy?.status == "accepted"
              //  && checkFriend
            ) {
              Request = {
                requestBy: user.id,
                requestTo: receiverId,
                roomId: roomId,
                status: "accepted",
                createdAt: CheckRequest.createdAt,
                updatedAt: CheckRequest.updatedAt,
                type: "Viewprofile",
                text: "Vie profile",
              };
            }
          } else {
            Request = {
              type: "Request",
              text: "Request profile access",
            };
          }
        }
      } else {
        console.log("VIVIVIVIIVIVIVIVVI2");
        if (FindQuestion?.displayProfile == true) {
          Request = {
            type: "Viewprofile",
            text: "View profile",
          };
        } else {
          if (CheckRequest) {
            if (CheckRequest?.status != "accepted") {
              if (
                CheckRequest?.requestBy?._id == user.id &&
                CheckRequest?.status == "pending"
                // &&
                // !checkFriend
              ) {
                Request = {
                  requestBy: user.id,
                  requestTo: receiverId,
                  roomId: roomId,
                  status: "pending",
                  createdAt: CheckRequest.createdAt,
                  updatedAt: CheckRequest.updatedAt,
                  type: "Requested",
                  text: "Requested profile access",
                };
              } else if (
                CheckRequest?.requestBy?._id != user.id &&
                CheckRequest?.status === "pending"
                //  &&
                // !checkFriend
              ) {
                Request = {
                  requestBy: receiverId,
                  requestTo: user.id,
                  roomId: roomId,
                  status: "pending",
                  createdAt: CheckRequest.createdAt,
                  updatedAt: CheckRequest.updatedAt,
                  type: "Received",
                  text: "Profile Access Allowed",
                };
              } else if (
                CheckRequest?.status === "decline"
                //  && !checkFriend
              ) {
                Request = {
                  requestBy: user.id,
                  requestTo: receiverId,
                  roomId: roomId,
                  status: "decline",
                  createdAt: CheckRequest.createdAt,
                  updatedAt: CheckRequest.updatedAt,
                  type: "Request",
                  text: "Request profile access",
                };
              }
              // else if (checkFriend) {
              //   Request = {
              //     requestBy: user.id,
              //     requestTo: receiverId,
              //     roomId: roomId,
              //     status: "accepted",
              //     createdAt: CheckRequest.createdAt,
              //     updatedAt: CheckRequest.updatedAt,
              //     type: "Viewprofile",
              //     text: "View profile",
              //   };
              // }
            } else if (
              CheckRequest?.status == "accepted"
              // && !checkFriend
            ) {
              if (CheckRequest?.acceptedBy != user.id) {
                Request = {
                  requestBy: user.id,
                  requestTo: receiverId,
                  roomId: roomId,
                  status: "accepted",
                  createdAt: CheckRequest.createdAt,
                  updatedAt: CheckRequest.updatedAt,
                  type: "Viewprofile",
                  text: "View profile",
                };
              } else {
                Request = {
                  type: "Request",
                  text: "Request profile access",
                };
              }
            } else if (
              requestedBy?.status == "accepted"
              //  && checkFriend
            ) {
              Request = {
                requestBy: user.id,
                requestTo: receiverId,
                roomId: roomId,
                status: "accepted",
                createdAt: CheckRequest.createdAt,
                updatedAt: CheckRequest.updatedAt,
                type: "Viewprofile",
                text: "View profile",
              };
            }
          } else {
            Request = {
              type: "Request",
              text: "Request profile access",
            };
          }
        }
      }
    }

    // Private Request

    if (requestPrivate) {
      if (requestPrivate?.status != "accepted") {
        if (
          requestPrivate?.requestBy?._id == user.id &&
          requestPrivate?.status == "pending"
        ) {
          PrivateRequest = {
            requestBy: user.id,
            requestTo: receiverId,
            roomId: roomId,
            status: "pending",
            createdAt: requestPrivate.createdAt,
            updatedAt: requestPrivate.updatedAt,
            type: "Requested",
            text: "Requested 1-on-1 chat access",
          };
        } else if (
          requestPrivate?.requestBy?._id != user.id &&
          requestPrivate?.status == "pending"
        ) {
          PrivateRequest = {
            requestBy: receiverId,
            requestTo: user.id,
            roomId: roomId,
            status: "pending",
            createdAt: requestPrivate.createdAt,
            updatedAt: requestPrivate.updatedAt,
            type: "Received",
            text: "Received 1-on-1 chat access",
          };
        } else if (
          requestPrivate?.status === "decline" ||
          requestPrivate?.status === "close"
        ) {
          PrivateRequest = {
            requestBy: user.id,
            requestTo: receiverId,
            roomId: roomId,
            status: requestPrivate?.status,
            createdAt: requestPrivate.createdAt,
            updatedAt: requestPrivate.updatedAt,
            type: "Request",
            text: "Request 1-on-1 chat access",
          };
        }
      } else {
        if (requestPrivate?.status === "accepted") {
          PrivateRequest = {
            requestBy: user.id,
            requestTo: receiverId,
            roomId: roomId,
            status: requestPrivate?.status,
            createdAt: requestPrivate.createdAt,
            updatedAt: requestPrivate.updatedAt,
            type: "Close",
            text: "Close 1-on-1 chat access",
          };
        } else {
          PrivateRequest = {
            requestBy: user.id,
            requestTo: receiverId,
            roomId: roomId,
            status: requestPrivate?.status,
            createdAt: requestPrivate.createdAt,
            updatedAt: requestPrivate.updatedAt,
            type: "Request",
            text: "Request  1-on-1 chat access",
          };
        }
      }
    } else {
      PrivateRequest = {
        type: "Request",
        text: "Request 1-on-1 chat access",
      };
    }

    if (conectIdExist(receiverId)) {
      Connections = {
        type: "Connected",
        text: "You are already connected ",
        id: null,
        disable: false,
      };
    } else if (findConection) {
      Connections = {
        type: "Connection-sent",
        text: "Withdraw request to join inner circle",
        id: findConection._id,
        disable: false,
      };
    } else {
      Connections = {
        type: "Connect",
        text: "Ask this person to join my LeaderBridge inner circle",
        disable: CheckConnection,
      };
    }

    if (findRequest) {
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_FETCHED,
        payload: {
          request: findRequest,
          requestText: Request,
          requestPrivate: findPrivateRequest,
          Connections: Connections,
          privateRequestText: PrivateRequest,
        },
        logPayload: false,
      };

      return data4createResponseObject;
    }
  },
};
