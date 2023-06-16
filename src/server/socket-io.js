"use strict";
const activeUsers = new Set();
const onlineUsers = {};
const chatCtrl = require("../api/chat");
const answerCtrl = require("../api/new_answer");
const { sendPushNotification } = require("../middlewares/pushNotification");
const vcxroom = require('../api/enablex/vcxroom');
const api4Connection = require("../api/connection/index");
const api4Notification = require("../api/notification/index");
const api4User = require("../api/user/index");
const api4Question = require("../api/question/index");
const api4Answer = require("../api/answer/index");
const messages = require("../../json/messages.json");
const { ObjectId } = require("mongodb");
const { on } = require("../logger");
const ws = require("ws");
const redis = require("redis");
const redisAdapter = require("socket.io-redis");
const connectedUsers = {};
module.exports = async (server, logger) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
    // transports: ["websocket"],
    allowEIO3: true,
    wsEngine: ws.Server,
  });

  // var client = redis.createClient({
  //   url: "redis://default:redispw@localhost:32776",
  //   legacyMode: true,
  // });

  // io.adapter(
  //   redisAdapter({
  //     url: "redis://default:redispw@localhost:32776",
  //     legacyMode: true,
  //   })
  // );

  // await client.connect();

  // client.ping(function (err, result) {
  //   if (err) {
  //     console.log("firstError");
  //     console.error(err);
  //   } else {
  //     console.log("Redis is SSSS:", result);
  //   }
  // });

  // client.get("add-answer", function (err, reply) {
  //   if (err) {
  //     console.error(err);
  //   } else {
  //     console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", reply);
  //   }
  // });

  io.use((socket, next) => {
    next();
  });

  io.on("connection", (socket) => {
    // console.log("User connected", socket.id);
    // logger.info(
    //   `CONN [${socket.id}] [WS] ${socket.handshake.url} ${JSON.stringify(
    //     socket.handshake
    //   )}`
    // );

    // Routes

    socket.on("join-room", async function ({ roomId, user }) {
      // console.log("join", roomId);
      let i = 0;
      console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXX", roomId, user);
      socket.join(roomId);
      // io.sockets.adapter.rooms[roomId];
      // connectedUsers[user] = socket;
      connectedUsers[socket.id] = { roomId, user };
      // socket.userId = user;
      // socket.join(user);
    });

    socket.on("login", async function ({ userId, status }) {
      // console.log("a user " + userId + " connected");
      // saving userId to object with socket ID
      onlineUsers[socket.id] = userId;
      // console.log("onlineUsers", onlineUsers);
      const userStatus = await api4User.updateOnlineStatus.handler({
        userId,
        status: true,
      });
      console.log(
        "---------------------1-----------------",
        userId,
        userStatus
      );
    });

    socket.on("disconnect", async () => {
      // console.log("user " + onlineUsers[socket.id] + " disconnected");
      // remove saved socket from onlineUsers object
      let userId = onlineUsers[socket.id];

      // console.log("-----2------", onlineUsers);
      const userStatus = await api4User.updateOnlineStatus.handler({
        userId,
        status: false,
      });
      delete onlineUsers[socket.id];
      delete connectedUsers[socket.id];
      // let i = onlineUsers.indexOf(socket.id);
      // onlineUsers.splice(i, 1);

      // console.log("userrrrStatussss", userStatus);
      // // delete onlineUsers[socket.id];
    });
    socket.on("leaveRoom", async ({ roomId }) => {
      console.log("LEAVEROOM", roomId);
      socket.leave(roomId);
    });

    // console.log("onlineUsers----global", onlineUsers);
    socket.on("join", async function ({ roomId, user }) {
      logger.info(`user join room : ${roomId}`);
      socket.userId = roomId;

      socket.join(roomId);

      try {
        if (roomId) {
          let chatHistory;
          // let ln = await io.in(roomId).allSockets();

          // if (ln.size == 2) {
          //   chatHistory = await chatCtrl.getMessages.handler(
          //     roomId,
          //     user,
          //     "user"
          //   );
          // } else {
          chatHistory = await chatCtrl.getMessages.handler(roomId, user);
          // }

          // console.log(
          //   "chatHistory--->>",
          //   roomId,

          //   user,
          //   chatHistory.payload.chats[chatHistory.payload.chats.length - 1]
          // );
          // console.log("////////////////history", chatHistory.payload);
          if (chatHistory.payload && chatHistory.payload.chats) {
            io.in(roomId).emit("history", { chats: chatHistory.payload });
          } else {
            io.in(roomId).emit("history", {});
          }
          // console.log("history sent");
          // console.log(
          //   "%%%%%%%%%%%%%%%%&&&&&&&&&&&_________________________&&&&&&&&&&&&&&&&&&&&message-sent",
          //   user,
          //   roomId
          // );
        }
      } catch (error) {
        console.log("Error in finding Chats ", error);
      }
    });

    socket.on("last-message", async function (user) {
      // console.log("LAST MESSAGE------------->>>>>>", user);
      try {
        let lastMessage = await chatCtrl.lastMessage.handler(user);
        // console.log("history", chatHistory.payload.chats);
        io.in(socket.id).emit("last-message", {
          chats: lastMessage.payload.chats,
        });
        console.log("last-message data sent");
      } catch (error) {
        console.log("Error in finding Chats ", error);
      }
    });

    socket.on("chat-room", async function (user) {
      // console.log("LAST MESSAGE------------->>>>>>", user);
      try {
        let allChatRoom = await chatCtrl.allChatRoom.handler(user);
        // console.log("history", allChatRoom.payload.room);

        io.in(socket.id).emit("chat-room", {
          room: allChatRoom.payload.room,
          userId: allChatRoom.payload.userId,
        });
        // console.log("Room data sent", allChatRoom.payload.room);
      } catch (error) {
        console.log("Error in finding Room ", error);
      }
    });

    socket.on("chat-notification", async function (user) {
      console.log("LASTMESSAGE1112222222222222", user);
      try {
        let chatnotification = await chatCtrl.chatnotification.handler(user);
        // console.log("history", allChatRoom.payload.room);
        io.in(socket.id).emit("chat-notification", {
          room: chatnotification.payload.room,
          userId: chatnotification.payload.userId,
        });
        // console.log("Room data sent111", chatnotification.payload.room);
      } catch (error) {
        console.log("Error in finding Room ", error);
      }
    });

    socket.on(
      "new-message",
      async function ({ roomId, sender, message, type, parentMessageId }) {
        // console.log({ roomId, sender, message, parentMessageId });
        try {
          console.log(
            "%%%%%%%%%%%%%%%%&&&&&&&&&&&_________________________&&&&&&&&&&&&&&&&&&&&message-sent",
            sender,
            roomId
          );
          let ln = await io.in(roomId).allSockets();

          console.log("AAAAASSSDDDDDDDDDD", ln);
          let newMsg;
          if (ln.size == 2) {
            newMsg = await chatCtrl.sendMessage.handler({
              roomId: roomId,
              sender: sender,
              message: message,
              type: type,
              parentMessageId: parentMessageId,
              flag: "seen",
            });
          } else {
            newMsg = await chatCtrl.sendMessage.handler({
              roomId: roomId,
              sender: sender,
              message: message,
              type: type,
              parentMessageId: parentMessageId,
            });
          }

          // newMsg = JSON.parse(JSON.stringify(newMsg));
          // newMsg["network"] = "1"
          // console.log("new-message", newMsg.payload.newChat);

          io.in(roomId).emit("new-message", newMsg.payload.newChat);
          io.emit("check-answer");

          let chatHistory = await chatCtrl.getMessages.handler(roomId);
          // console.log("history", chatHistory.payload.chats);
          io.in(socket.id).emit("history", {
            chats: chatHistory.payload.chats,
          });
          io.emit("check-answer");
        } catch (error) {
          console.log("Error in sending message", error.message);
        }
      }
    );

    socket.on("answer-room", async function (user, question) {
      // console.log("answer-room------------->>>>>>", user);
      try {
        let answerRoom = await answerCtrl.getAnswerRoom.handler(user, question);
        // console.log("ROOM--->>>", answerRoom.payload.room);
        io.in(socket.id).emit("answer-room", answerRoom.payload.room);
        // console.log("room data sent");
      } catch (error) {
        console.log("Error in finding Chats ", error);
      }
    });

    socket.on(
      "answer",
      async function ({
        user,
        roomId,
        questionId,
        isGroup,
        check,
        page,
        limit,
      }) {
        if (roomId) {
          socket.userId = roomId;

          // socket.join(roomId);
        }

        // if (roomMakeid) {
        //   socket.userId = roomMakeid;

        //   socket.join(roomMakeid);
        // }

        // if (roomListId) {
        //   socket.userId = roomListId;

        //   socket.join(roomListId);
        // }

        try {
          let answer = await answerCtrl.getAnswerByRoom.handler({
            user: user,
            roomId: roomId,
            questionId: questionId,
            isGroup: isGroup,
            check: check,
            page: page,
            limit: limit,
          });
          if (answer?.payload?.answer) {
            io.in(socket.id).emit("answer", answer.payload);
            io.emit("answer-room", "get-room");
          }
        } catch (error) {
          console.log("Error in finding Chats ", error);
        }
      }
    );

    socket.on(
      "answer-pagination",
      async function ({
        user,
        roomId,
        questionId,
        isGroup,
        check,
        page,
        limit,
      }) {
        try {
          let answer = await answerCtrl.PaginationAnswer.handler({
            user: user,
            roomId: roomId,
            questionId: questionId,
            isGroup: isGroup,
            check: check,
            page: page,
            limit: limit,
          });
          if (answer?.payload?.answer) {
            io.in(socket.id).emit("answer-pagination", answer.payload);
          }
        } catch (error) {
          console.log("Error in finding Chats ", error);
        }
      }
    );
    socket.on(
      "get-request",
      async function ({
        user,
        receiverId,
        roomId,
        isGroup,
        questionId,
        answerId,
      }) {
        try {
          let GetRequest = await answerCtrl.checkRequest.handler({
            user: user,
            roomId: roomId,
            receiverId: receiverId,
            isGroup: isGroup,
            questionId: questionId,
            answerId: answerId,
          });
          // console.log("get----->>>", answer.payload);
          io.in(socket.id).emit("get-request", GetRequest?.payload);
        } catch (error) {
          console.log("Error in finding Chats ", error);
        }
      }
    );

    socket.on("check-private-or-group", async function ({ user, questionId }) {
      console.log("check-private-or-group------------->>>>>>", user);
      try {
        let GetRequest = await answerCtrl.CheckGroupPrivate.handler({
          user: user,
          questionId: questionId,
        });

        console.log("get----->>>DDDDDDDD", GetRequest?.payload);
        // console.log("get----->>>", answer.payload);
        io.in(socket.id).emit("check-private-or-group", GetRequest?.payload);
      } catch (error) {
        console.log("Error in finding Chats ", error);
      }
    });

    socket.on(
      "add-answer",
      async function ({
        user,
        question,
        answer,
        roomId,
        status,
        user_type,
        currentRole,
        type,
        isGroup,
      }) {
        // console.log("add-answer------------->>>>>>", user);
        socket.join(roomId);
        let ln = await io.in(roomId).allSockets();
        console.log("add-answer------------->>>>>>", ln); // Set { <socket.id>, ... }

        try {
          let addAnswer = await answerCtrl.newAnswer.handler({
            user: user,
            question: question,
            answer: answer,
            roomId: roomId,
            status: status,
            user_type: user_type,
            currentRole: currentRole,
            type: type,
            flag: "seen",
            isGroup: isGroup,
          });

          // client.set("add-answer", addAnswer.payload.answer, () => {
          console.log("QQQQQQQQQFFFFFFFFFFFFFF", socket.id);

          const isUserInRoom = Object.values(connectedUsers).filter(
            (user) => user.roomId === roomId
          );

          console.log("CCCCCCCCCCCCVVVVVVVVVVVVV", isUserInRoom);
          const FindAndMap = Promise.all(
            isUserInRoom.map(async (user) => {
              let updateChat = await global.models.GLOBAL.ANSWER.updateMany(
                { roomId: ObjectId(user.roomId) },
                { $addToSet: { seenBy: ObjectId(user.user) } }
              );
            })
          ).then((data) => {
            console.log('ADDANSWER', socket.id);
            socket.to(roomId).emit("add-answer", addAnswer.payload.answer);
          });

          // socket.to(roomId).emit("add-answer", addAnswer.payload.answer);

          socket.in(roomId).emit("server-data", addAnswer.payload.answer);
          // });

          // io.emit("check-connection", "get");

          const notification =
            await api4Notification.getNotificationCount.handler({
              user,
            });

          io.emit("get-notification-count-request", { notification: true });
          io.emit("get-notification-request", { notification: true });
          io.emit("check-private-or-group", "get");
          io.emit("answer-room", "get-room");
          io.emit("get-request", "get");

          let GetRequest = await answerCtrl.CheckGroupPrivate.handler({
            user: user,
            questionId: question,
          });

          console.log("AAAAAAAAAAAAAQQQQQQQQQQQQ", GetRequest);
          io.in(roomId).emit("check-group", GetRequest?.payload);
        } catch (error) {
          console.log("Error in adding Answer ", error);
        }
      }
    );

    // New Request in Answer
    socket.on("request", async function ({ user, question, roomId }) {
      // console.log("add-answer------------->>>>>>", user);
      try {
        let addRequest = await answerCtrl.requestProfile.handler({
          user: user,
          question: question,
          roomId: roomId,
        });
        io.in(socket.id).emit("request", addRequest.payload.newRequest);
        io.emit("check-answer");
      } catch (error) {
        console.log("Error in adding request ", error);
      }
    });

    // New Request in See-Answer
    socket.on(
      "new-request",
      async function ({ user, id, roomId, typeofRequest, questionId, owner }) {
        // console.log("add-answer------------->>>>>>", user);
        try {
          let addNewRequest = await answerCtrl.requestProfileInSeeAns.handler({
            user: user,
            id: id,
            roomId: roomId,
            typeof: typeofRequest,
            questionId: questionId,
            owner: owner,
          });

          socket
            .to(roomId)
            .emit("new-request", addNewRequest.payload.newRequest);
          io.emit("check-answer");
        } catch (error) {
          console.log("Error in adding request ", error);
        }
      }
    );

    socket.on(
      "close-request",
      async function ({ user, id, roomId, typeofRequest, questionId, owner }) {
        // console.log("add-answer------------->>>>>>", user);
        try {
          let addNewRequest = await answerCtrl.ClosePrivateRequest.handler({
            user: user,
            id: id,
            roomId: roomId,
            typeof: typeofRequest,
            questionId: questionId,
            owner: owner,
          });

          io.in(socket.id).emit(
            "close-request",
            addNewRequest.payload.newRequest
          );
          io.emit("check-private-or-group", "get");
          io.emit("check-group");
          if (addNewRequest.payload.newRequest) {
            let privateRequest = await answerCtrl.CheckPrivate.handler({
              roomId: roomId,
            });

            io.in(socket.id).emit("check-room", privateRequest.payload);

            // console.log("get----->>>", answer.payload);
          }

          io.emit("check-answer");
        } catch (error) {
          console.log("Error in adding request ", error);
        }
      }
    );

    socket.on(
      "private-request",
      async function ({ user, id, roomId, typeofRequest, questionId, owner }) {
        // console.log("add-answer------------->>>>>>", user);
        try {
          let privateRequest = await answerCtrl.privateRequest.handler({
            user: user,
            id: id,
            roomId: roomId,
            typeof: typeofRequest,
            questionId: questionId,
            owner: owner,
          });

          console.log("AQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ", privateRequest);

          io.in(socket.id).emit(
            "private-request",
            privateRequest.payload.newRequest
          );
          io.emit("check-answer");
        } catch (error) {
          console.log("Error in adding request ", error);
        }
      }
    );

    socket.on("check-room", async function ({ roomId }) {
      // console.log("add-answer------------->>>>>>", user);
      try {
        let privateRequest = await answerCtrl.CheckPrivate.handler({
          roomId: roomId,
        });

        io.in(socket.id).emit("check-room", privateRequest.payload);
        // io.emit("check-answer");
      } catch (error) {
        console.log("Error in adding request ", error);
      }
    });

    // New Request in Chat
    socket.on(
      "new-request-chat",
      async function ({ user, id, roomId, typeOfRequest }) {
        // console.log("add-answer------------->>>>>>", user);
        try {
          let addNewRequestInChat = await chatCtrl.requestProfile.handler({
            user: user,
            id: id,
            roomId: roomId,
            typeOfRequest: typeOfRequest,
          });

          io.in(socket.id).emit(
            "new-request-chat",
            addNewRequestInChat.payload.newRequest
          );

          console.log("AAAAAAAAQQQQQQQQQWWWWWWWWW", addNewRequestInChat);
          io.emit("check-answer");
        } catch (error) {
          console.log("Error in adding request ", error);
        }
      }
    );

    //Accept Request in Answer
    socket.on(
      "accept-request",
      async function ({
        user,
        requestId,
        questionId,
        type,
        receiverId,
        owner,
      }) {
        // console.log("add-answer------------->>>>>>", user);
        try {
          let aacceptRequest = await answerCtrl.acceptRequest.handler({
            user: user,
            requestId: requestId,
            questionId: questionId,
            type: type,
            receiverId: receiverId,
            owner: owner,
          });

          console.log("AAAAAASSSSSSSSSCCCCFFF", aacceptRequest);

          io.in(socket.id).emit(
            "accept-request",
            aacceptRequest.payload.updateRequest
          );

          let privateRequest = await answerCtrl.CheckPrivate.handler({
            roomId: aacceptRequest.payload.updateRequest.roomId,
          });

          io.in(socket.id).emit("check-room", privateRequest.payload);
          let GetRequest = await answerCtrl.CheckGroupPrivate.handler({
            user: user,
            questionId: questionId,
          });

          // console.log("get----->>>", answer.payload);
          io.emit("check-private-or-group", "get");
          io.emit("check-group");

          io.emit("check-answer");
        } catch (error) {
          console.log("Error in accepting request ", error);
        }
      }
    );

    //Accept Request in Chat
    socket.on(
      "accept-request-chat",
      async function ({ user, requestId, status, Notification, id }) {
        try {
          let aacceptRequest = await chatCtrl.acceptRequest.handler({
            user: user,
            requestId: requestId,
            status: status,
            Notification: Notification,
            id: id,
          });

          io.emit("get-notification-count-request", { notification: true });
          io.emit("get-notification-request", { notification: true });

          io.in(socket.id).emit(
            "accept-request-chat",
            aacceptRequest.payload.updateRequest
          );
          io.emit("check-answer");
        } catch (error) {
          console.log("Error in accepting request ", error);
        }
      }
    );

    //Decline Request in Answer
    socket.on(
      "decline-request",
      async function ({ user, requestId, questionId, type, owner }) {
        // console.log("add-answer------------->>>>>>", user);
        try {
          let declineRequest = await answerCtrl.declineRequest.handler({
            user: user,
            requestId: requestId,
            questionId: questionId,
            type: type,
            owner: owner,
          });

          io.in(socket.id).emit(
            "decline-request",
            declineRequest.payload.updateRequest
          );
          io.emit("check-answer");
        } catch (error) {
          console.log("Error in declining request ", error);
        }
      }
    );

    socket.on(
      "private-request-decline",
      async function ({ user, requestId, questionId }) {
        // console.log("add-answer------------->>>>>>", user);
        try {
          let declineRequest = await answerCtrl.privateRequestDecline.handler({
            user: user,
            requestId: requestId,
            questionId: questionId,
          });

          io.in(socket.id).emit(
            "private-request-decline",
            declineRequest.payload.updateRequest
          );
          io.emit("check-answer");
        } catch (error) {
          console.log("Error in declining request ", error);
        }
      }
    );

    //Decline Request in Chat
    socket.on(
      "decline-request-chat",
      async function ({ user, requestId, Notification }) {
        // console.log("add-answer------------->>>>>>", user);
        try {
          let declineRequest = await chatCtrl.declineRequest.handler({
            user: user,
            requestId: requestId,
            Notification: Notification,
          });

          io.emit("get-notification-count-request", { notification: true });
          io.emit("get-notification-request", { notification: true });

          io.in(socket.id).emit(
            "decline-request-chat",
            declineRequest.payload.updateRequest
          );
          io.emit("check-answer");
        } catch (error) {
          console.log("Error in declining request ", error);
        }
      }
    );

    // Socket "Join-Profile"
    socket.on("join-profile", async function ({ profileId }) {
      socket.profileId = String(profileId);
      activeUsers.add(String(profileId));
      socket.join(String(profileId));
      io.in(socket.id).emit("user join profile");
    });

    // Socket "Call Connect"

    // Original
    // socket.on(
    //   "connectCall",
    //   async function ({ channelName, otherId, isForVideoCall, token }) {

    //     console.log('TOKENNNNNNNN', token);

    //     let findToken = await global.models.GLOBAL.USER.findOne({
    //       _id: otherId,
    //     });
    //     delete findToken.password;
    //     let loginUser = await global.models.GLOBAL.USER.findOne({
    //       _id: channelName,
    //     });
    //     delete loginUser.password;
    //     const desc = {
    //       data: { title: "Leaderbridge" },
    //       notification: {
    //         title: "New Call notification",
    //         body: `Someone is calling`,
    //       },
    //     };

    //     if (findToken.deviceToken !== "1234") {
    //       let data = {
    //         payload: desc,
    //         firebaseToken: findToken.deviceToken,
    //       };
    //       sendPushNotification(data);
    //     }
    //     if (token) {
    //       let data = {
    //         msg: "call Requested",
    //         channelName: String(channelName),
    //         otherId: String(otherId),
    //         isForVideoCall: Boolean(isForVideoCall),
    //         token: token,
    //         otherUser: findToken,
    //         loginUser: loginUser,
    //       };

    //       console.log('CALLCONNECT', channelName, otherId);
    //       console.log(io.of("/").adapter.rooms.get(String(channelName)));
    //       console.log(io.of("/").adapter.rooms.get(String(otherId)));
    //       io.in(String(channelName)).emit("onCallRequest", data);
    //       io.in(String(otherId)).emit("onCallRequest", data);
    //     }
    //   }
    // );
    // Original

    // himanshu@johnbehrgroup.com
    socket.on(
      "connectCall",
      async function ({ channelName, otherId, isForVideoCall, token }) {

        console.log('TOKENNNNNNNN', token);

        let findToken = await global.models.GLOBAL.USER.findOne({
          _id: otherId,
        });
        delete findToken.password;
        let loginUser = await global.models.GLOBAL.USER.findOne({
          _id: channelName,
        });
        delete loginUser.password;
        const desc = {
          data: { title: "Leaderbridge" },
          notification: {
            title: "New Call notification",
            body: `Someone is calling`,
          },
        };

        if (findToken.deviceToken !== "1234") {
          let data = {
            payload: desc,
            firebaseToken: findToken.deviceToken,
          };
          sendPushNotification(data);
        }

        // if (token) {
        vcxroom.createRoom((status, roomData) => {
          if (status === 'success') {
            vcxroom.getToken({
              roomId: roomData.room.room_id,
              name: String(channelName),
              role: 'participant',
              user_ref: String(channelName)
            }, (status, initiatorTokenData) => {
              if (status === 'success') {
                vcxroom.getToken({
                  roomId: roomData.room.room_id,
                  name: String(otherId),
                  role: 'participant',
                  user_ref: String(otherId)
                }, (status, receiverTokenData) => {
                  if (status === 'success') {
                    let initiatorData = {
                      msg: "call Requested",
                      channelName: String(channelName),
                      otherId: String(otherId),
                      isForVideoCall: Boolean(isForVideoCall),
                      token: initiatorTokenData?.token,
                      otherUser: findToken,
                      loginUser: loginUser,
                    };

                    let receiverData = {
                      msg: "call Requested",
                      channelName: String(channelName),
                      otherId: String(otherId),
                      isForVideoCall: Boolean(isForVideoCall),
                      token: receiverTokenData?.token,
                      otherUser: findToken,
                      loginUser: loginUser,
                    };
          
                    // console.log('CALLCONNECT', channelName, otherId);
                    // console.log(io.of("/").adapter.rooms.get(String(channelName)));
                    // console.log(io.of("/").adapter.rooms.get(String(otherId)));
                    io.in(String(channelName)).emit("onCallRequest", initiatorData);
                    io.in(String(otherId)).emit("onCallRequest", receiverData);
                  } else {

                  }
                })
              } else {

              }
            })
            
          } else {

          }
          
        })
      }
      // }
    );
    // himanshu@johnbehrgroup.com

    //  socket "acceptCall"
    socket.on(
      "acceptCall",
      async function ({ channelName, otherId, isForVideoCall, token }) {


        console.log('TOKEEEEEEEEEEEN', token);

        const res = {
          msg: "call accepted",
          channelName: String(channelName),
          otherId: String(otherId),
          isForVideoCall: Boolean(isForVideoCall),
          token: token,
        };
        io.in(String(channelName)).emit("onAcceptCall", res);
        io.in(String(otherId)).emit("onAcceptCall", res);
      }
    );

    // Socket "Call Reject"
    socket.on(
      "rejectCall",
      async function ({ channelName, otherId, isForVideoCall, token }) {
        const res = {
          msg: "call disconnected",
          channelName: String(channelName),
          otherId: String(otherId),
          isForVideoCall: Boolean(isForVideoCall),
          token: token,
        };
        io.in(String(channelName)).emit("onRejectCall", res);
        io.in(String(otherId)).emit("onRejectCall", res);
      }
    );

    socket.on("delete-answer", async function ({ answerId, user }) {
      let deleteAnswer = await api4Answer.deleteAnswer.handler({
        answerId: answerId,
        userData: user,
      });
      io.in(socket.id).emit("delete-answer", deleteAnswer);
      io.emit("check-answer");
      io.emit("check-connection", "get");
      io.emit("get-request", "get");
      // console.log("delete-answer", deleteAnswer);

      // delete answer from answer collection

      // if (!answerId) {
      //   const data4createResponseObject = {
      //     // req: req,
      //     result: -1,
      //     message: messages.INVALID_PARAMETERS,
      //     payload: {},
      //     logPayload: false,
      //   };
      //   return data4createResponseObject;
      // }
      // try {
      //   const answerExists = await global.models.GLOBAL.ANSWER.findOne({
      //     _id: answerId,
      //   });
      //   // console.log("USER---->>", user._id);
      //   // console.log("ANS---->>>", answerExists);
      //   let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
      //     _id: answerExists.question,
      //   });
      //   if (findQuestion) {
      //     const deleteAnswer =
      //       await global.models.GLOBAL.ANSWER.findOneAndRemove({
      //         _id: answerId,
      //       });

      //     const getLastAnswer = await global.models.GLOBAL.ANSWER.findOne({
      //       question: findQuestion._id,
      //     }).sort({ createdAt: -1 });

      //     let lastMessageObj = {
      //       answerId: getLastAnswer._id,
      //       answer: getLastAnswer.answer,
      //       createdAt: Date.now(),
      //     };

      //     await global.models.GLOBAL.ANSWER_ROOM.findOneAndUpdate(
      //       {
      //         // _id:roomId,
      //         _id: getLastAnswer.roomId,
      //       },
      //       { $set: { lastMessage: lastMessageObj } },
      //       { new: true }
      //     );

      //     const decreaseResponse =
      //       await global.models.GLOBAL.QUESTION.updateOne(
      //         { _id: findQuestion._id, createdBy: findQuestion.createdBy },
      //         { $inc: { response: -1 } },
      //         { new: true }
      //       );

      //     if (deleteAnswer) {
      //       // const data4createResponseObject = {
      //       //   // req: req,
      //       //   result: 0,
      //       //   message: "Answer deleted successfully",
      //       //   payload: {},
      //       //   logPayload: false,
      //       // };

      //       io.in(socket.id).emit("delete-answer", deleteAnswer);
      //       io.emit("check-answer");
      //       return data4createResponseObject;
      //     } else {
      //       // const data4createResponseObject = {
      //       //   // req: req,
      //       //   result: -1,
      //       //   message: messages.NOT_ALLOWED,
      //       //   payload: {},
      //       //   logPayload: false,
      //       // };
      //       io.emit("check-answer");
      //       return data4createResponseObject;
      //     }
      //   } else {
      //     // const data4createResponseObject = {
      //     //   // req: req,
      //     //   result: -1,
      //     //   message: "Sorry, Something went wrong to delete answer.",
      //     //   payload: {},
      //     //   logPayload: false,
      //     // };
      //     io.emit("check-answer");
      //     io.in(socket.id).emit("delete-answer", deleteAnswer);
      //     return data4createResponseObject;
      //   }
      // } catch (error) {
      //   // const data4createResponseObject = {
      //   //   // req: req,
      //   //   result: -1,
      //   //   message: messages.GENERAL,
      //   //   payload: {},
      //   //   logPayload: false,
      //   // };
      //   // res
      //   //   .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
      //   //   .json(utils.createResponseObject(data4createResponseObject));
      // }
    });

    socket.on("edit-answer", async function ({ answerId, answer }) {
      if (!answerId) {
        // const data4createResponseObject = {
        //   // req: req,
        //   result: -1,
        //   message: "Invalid parameters",
        //   payload: {},
        //   logPayload: false,
        // };
        // return res
        //   .status(enums.HTTP_CODES.BAD_REQUEST)
        //   .json(utils.createResponseObject(data4createResponseObject));
      }
      try {
        const answerExists = await global.models.GLOBAL.ANSWER.findOne({
          _id: answerId,
        });

        let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
          _id: answerExists.question,
        });
        if (findQuestion) {
          const editAnswer = await global.models.GLOBAL.ANSWER.findOneAndUpdate(
            { _id: answerId },
            {
              $set: {
                answer: answer,
                isUpdated: true,
              },
            }
          );

          if (editAnswer) {
            const data4createResponseObject = {
              // req: req,
              result: 0,
              message: "Answer edited successfully",
              payload: {},
              logPayload: false,
            };
            io.in(socket.id).emit("edit-answer", editAnswer);
            io.emit("check-answer");
            // res
            //   .status(enums.HTTP_CODES.OK)
            //   .json(utils.createResponseObject(data4createResponseObject));
          } else {
            const data4createResponseObject = {
              // req: req,
              result: -1,
              message: "Sorry, Something went wrong to edit answer.",
              payload: {},
              logPayload: false,
            };
            // res.status(enums.HTTP_CODES.OK);
          }
        }
      } catch (error) {
        logger.error(`Error encountered: ${error.message}\n${error.stack}`);
        const data4createResponseObject = {
          // req: req,
          result: -1,
          message: "Sorry, Something went wrong to edit answer.",
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    });

    socket.on("check-answer", async function () {});

    socket.on("star-messages", async function ({ messageId, userId, star }) {
      try {
        if (messageId) {
          let starMessage;
          if (star == true) {
            starMessage = await global.models.GLOBAL.CHAT.findByIdAndUpdate(
              {
                _id: messageId,
              },
              {
                isStar: true,

                $push: {
                  starredBy: userId,
                },
              },
              {
                new: true,
              }
            );
          } else {
            starMessage = await global.models.GLOBAL.CHAT.findByIdAndUpdate(
              {
                _id: messageId,
              },
              {
                $set: {
                  isStar: false,
                },
                $pull: {
                  starredBy: userId,
                },
              },
              {
                new: true,
              }
            );
          }
          if (!starMessage) {
            const data4createResponseObject = {
              req: req,
              result: -1,
              message: messages.GENERAL,
              payload: {},
              logPayload: false,
            };
            return res
              .status(enums.HTTP_CODES.BAD_REQUEST)
              .json(utils.createResponseObject(data4createResponseObject));
          } else {
            const data4createResponseObject = {
              req: req,
              result: 0,
              message: "MESSAGE STAR SUCCESSFULLY.",
              payload: { starMessage },
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
        return data4createResponseObject;
      }
    });

    socket.on("error", function (err) {
      console.log(err);
    });

    // conection connected

    socket.on("connection-connected", async function ({ user }) {
      const conection = await api4Connection.getConnected.handler({ user });
      io.in(socket.id).emit("connection-connected", {
        conection: conection,
      });
    });

    socket.on("connection-received", async function ({ user }) {
      const conection = await api4Connection.getConnectionreceived.handler({
        user,
      });
      io.in(socket.id).emit("connection-received", {
        conection: conection,
      });
    });

    socket.on("connection-received-sent", async function ({ user }) {
      const conection = await api4Connection.getConnectionsent.handler({
        user,
      });

      io.in(socket.id).emit("connection-received-sent", {
        conection: conection,
      });
    });

    socket.on("connection-find-sent-app", async function ({ user }) {
      const conection = await api4Connection.getConnectionsent.handler({
        user,
      });

      io.in(socket.id).emit("connection-find-sent", {
        conection: conection,
      });
    });

    socket.on(
      "accept-connection",
      async function ({ user, accepted, receiverId, connectionId }) {
        const conection = await api4Connection.acceptConnection.handler({
          user,
          accepted,
          receiverId,
          connectionId,
        });
        const conectionsent = await api4Connection.getConnectionsent.handler({
          user,
        });
        io.in(socket.id).emit("connection-received-sent", {
          conection: conectionsent,
        });
        const conectionreceived =
          await api4Connection.getConnectionreceived.handler({
            user,
          });
        io.in(socket.id).emit("connection-received", {
          conection: conectionreceived,
        });
        const conectionConected = await api4Connection.getConnected.handler({
          user,
        });
        io.in(socket.id).emit("connection-connected", {
          conection: conectionConected,
        });
        io.in(socket.id).emit("accept-connection", {
          conection: conection,
        });

        io.emit("get-request", "get");

        io.in(socket.id).emit("answer", {
          answer: "answer",
        });
      }
    );

    socket.on(
      "edit-uniquename",
      async function ({ user, receiverId, unknownName }) {
        const EditName = await api4User.EditUniqueName.handler({
          user,
          receiverId,
          unknownName,
        });
        const conectionsent = await api4Connection.getConnectionsent.handler({
          user,
        });
        io.in(socket.id).emit("connection-received-sent", {
          conection: conectionsent,
        });
        const conectionreceived =
          await api4Connection.getConnectionreceived.handler({
            user,
          });
        io.in(socket.id).emit("connection-received", {
          conection: conectionreceived,
        });
        const conectionConected = await api4Connection.getConnected.handler({
          user,
        });
        io.in(socket.id).emit("connection-connected", {
          conection: conectionConected,
        });
        io.in(socket.id).emit("edit-uniquename", {
          conection: EditName,
        });

        io.in(socket.id).emit("answer", {
          answer: "answer",
        });
      }
    );

    socket.on(
      "decline-connection",
      async function ({ user, senderId, connectionId }) {
        const conection = await api4Connection.diclineConnection.handler({
          user,
          senderId,
          connectionId,
        });
        const conectionsent = await api4Connection.getConnectionsent.handler({
          user,
        });

        io.in(socket.id).emit("connection-received-sent", {
          conection: conectionsent,
        });
        const conectionreceived =
          await api4Connection.getConnectionreceived.handler({
            user,
          });
        io.in(socket.id).emit("connection-received", {
          conection: conectionreceived,
        });
        const conectionConected = await api4Connection.getConnected.handler({
          user,
        });
        io.emit("connection-received-sent", {
          conection: "get",
        });
        io.in(socket.id).emit("connection-connected", {
          conection: conectionConected,
        });
        io.in(socket.id).emit("decline-connection", {
          conection: conection,
        });
        io.in(socket.id).emit("answer", {
          answer: "answer",
        });
        io.emit("get-request", "get");
      }
    );

    socket.on("get-notification-request", async function ({ user }) {
      try {
        const notification = await api4Notification.getAllNotification.handler({
          user,
        });

        io.in(socket.id).emit("get-notification", {
          notification: notification,
        });
      } catch (error) {
        console.log("get-notification", error);
      }
    });
    socket.on("change-notification-status", async function ({ user, status }) {
      try {
        await api4Notification.getAllNotification.handler({
          user,
          status,
        });
        const notification =
          await api4Notification.getNotificationCount.handler({
            user,
          });

        io.in(socket.id).emit("get-notification-count", {
          notification: notification,
        });
      } catch (error) {
        console.log("get-notification", error);
      }
    });

    socket.on("get-notification-count-request", async function ({ user }) {
      try {
        const notificationCountData =
          await api4Notification.getNotificationCount.handler({
            user,
          });

        io.in(socket.id).emit("get-notification-count", {
          notification: notificationCountData,
        });
      } catch (error) {
        console.log("get-notification-count", error);
      }
    });

    socket.on("block-user", async function ({ user, userId }) {
      const conection = await api4User.blockUser.handler({
        user,
        userId,
      });

      const conectionConected = await api4Connection.getConnected.handler({
        user,
      });
      io.in(socket.id).emit("connection-connected", {
        conection: conectionConected,
      });
      io.emit("connection-received-sent", {
        conection: "get",
      });

      io.in(socket.id).emit("block-user", {
        conection: conection,
      });

      // again check this is block user

      io.emit("get-block-status", {
        blockedUser: "get-block",
      });
    });

    socket.on("remove-user", async function ({ user, remove, removeId }) {
      const conection = await api4Connection.removeConnection.handler({
        user,
        remove,
        removeId,
      });

      const conectionConected = await api4Connection.getConnected.handler({
        user,
      });
      io.in(socket.id).emit("connection-connected", {
        conection: conectionConected,
      });
      io.in(socket.id).emit("remove-user", {
        conection: conection,
      });
      io.in(socket.id).emit("answer", {
        answer: "answer",
      });
    });

    socket.on(
      "add-connection",
      async function ({ user, receiverId, message, reason }) {
        const conection = await api4Connection.addConnection.handler({
          user,
          receiverId,
          message,
          reason,
        });

        console.log("QQQQQQQQWWWWWQQQQQQQQQQWWWWW", conection);
        io.in(socket.id).emit("add-connection", {
          conection: conection,
        });

        const conectionreceived =
          await api4Connection.getConnectionreceived.handler({
            user,
          });

        io.emit("connection-received", {
          conection: "get",
        });

        io.emit("connection-received-sent", {
          conection: "get",
        });

        io.emit("get-notification-count-request", { notification: true });
        io.emit("get-notification-request", { notification: true });
      }
    );

    socket.on("withdraw-request", async function ({ user, connectionId }) {
      const withdraw = await api4Connection.withdrawConnection.handler({
        user,
        connectionId,
      });

      console.log("CCCCCCCCCCCCCCCCCCCCCCCCCCC", withdraw);

      io.in(socket.id).emit("withdraw-request", {
        conection: withdraw,
      });

      io.emit("connection-received-sent", {
        conection: "get",
      });

      io.emit("connection-received", {
        conection: "get",
      });
      io.in(socket.id).emit("answer", {
        answer: "answer",
      });
    });

    socket.on("unblock-user", async function ({ user, userId }) {
      const conection = await api4User.unBlockUser.handler({
        user,
        userId,
      });

      const conectionConected = await api4Connection.getConnected.handler({
        user,
      });
      io.in(socket.id).emit("connection-connected", {
        conection: conectionConected,
      });

      io.in(socket.id).emit("unblock-user", {
        conection: conection,
      });

      io.emit("get-block-user", {
        blockedUser: "get-block",
      });

      io.emit("get-block-status", {
        blockedUser: "get-block",
      });
    });

    socket.on("get-block-user", async function ({ user, query }) {
      const blockedUser = await api4User.getBlockuser.handler({
        user,
        query,
      });

      // if (blockedUser?.payload?.blockUser.length > 0) {
      io.in(socket.id).emit("get-block-user", {
        blockedUser: blockedUser,
      });
      // }
    });

    socket.on("unblock-user", async function ({ user, userId }) {
      const unblock = await api4User.unBlockUser.handler({
        user,
        userId,
      });

      io.in(socket.id).emit("unblock-user", {
        connection: unblock,
      });
      io.emit("get-block-user", {
        blockedUser: "get-block",
      });
    });

    // get-block-user-status

    socket.on(
      "get-block-status",
      async function ({ user, userId, roomId, questionId, isGroup }) {
        const blockedUser = await api4User.getBlockstatus.handler({
          user,
          userId,
          roomId,
          questionId,
          isGroup,
        });
        io.in(socket.id).emit("get-block-status", {
          blockedUser: blockedUser,
        });
      }
    );

    socket.on("answer-everyone", async function ({ user, questionId, status }) {
      const Everyone = await api4Answer.everyoneAnswer.handler({
        user,
        questionId,
        status,
      });
      io.in(socket.id).emit("who-can-see", {
        WhoSee: "get",
      });
      io.in(socket.id).emit("answer-everyone", {
        Everyone: Everyone,
      });
    });

    socket.on("answer-admin", async function ({ user, questionId, status }) {
      const AdminAnswer = await api4Answer.onlyAdmin.handler({
        user,
        questionId,
        status,
      });
      io.in(socket.id).emit("who-can-see", {
        WhoSee: "get",
      });
      io.in(socket.id).emit("answer-admin", {
        Admin: AdminAnswer,
      });
    });

    socket.on("who-can-see", async function ({ user, questionId }) {
      const WhoSee = await api4Answer.WhoCanseeAnswer.handler({
        user,
        questionId,
      });

      io.in(socket.id).emit("who-can-see", {
        WhoSee: WhoSee,
      });
    });

    socket.on("answer-room-admin", async function ({ questionId }) {
      const AnswerRoomAdmin = await answerCtrl.getAnswerByRoomAdmin.handler({
        questionId,
      });

      io.in(socket.id).emit("answer-room-admin", {
        AnswerRoomAdmin: AnswerRoomAdmin,
      });
    });

    socket.on("get-answer-admin", async function ({ roomId }) {
      const AnswerRoomAdmin = await answerCtrl.getAnswerAdmin.handler({
        roomId,
      });

      io.in(socket.id).emit("get-answer-admin", {
        AnswerRoomAdmin: AnswerRoomAdmin,
      });
    });

    socket.on(
      "abuse-answer",
      async function ({ user, answerId, reason, questionId }) {
        const AbuseAnswer = await api4Answer.abuseAnswer.handler({
          user,
          answerId,
          reason,
          questionId,
        });
        io.emit("check-answer");
        io.in(socket.id).emit("abuse-answer", {
          AbuseAnswer: AbuseAnswer,
        });
      }
    );

    socket.on("check-connection", async function ({ user, roomId, question }) {
      const checkConnection = await api4Answer.CheckConnection.handler({
        user,
        roomId,
        question,
      });
      io.emit("check-connection", {
        checkConnection: checkConnection,
      });
    });

    socket.on("group-response", async function ({ user, questionId }) {
      const GroupResponses = await api4Answer.GroupResponses.handler({
        user,
        questionId,
      });
      // io.emit("check-answer");
      io.in(socket.id).emit("group-response", {
        GroupResponses: GroupResponses,
      });
    });
  });
};
