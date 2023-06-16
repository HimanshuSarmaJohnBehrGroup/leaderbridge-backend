const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const { sendPushNotification } = require("../../middlewares/pushNotification");
const { ObjectId, ObjectID } = require("mongodb");

// Add Answer
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { question, answer, roomId, status, user_type, flag, type, isGroup } =
      req;
    let user = await utils.getHeaderFromToken(req.user);
    let AnswerTag;
    let displayProfile;

    const FindUser = await global.models.GLOBAL.USER.findOne({
      _id: user.id,
    });

    if (!question || !answer || !roomId) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
    }

    try {
      let newAnswer;
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: question,
      });

      const userOnline = await global.models.GLOBAL.USER.findOne({
        _id: findQuestion.createdBy,
        // isOnline: true,
      });

      const FindUser = await global.models.GLOBAL.USER.findOne({
        _id: user.id,
      });

      if (findQuestion.createdBy == user.id) {
        displayProfile = findQuestion?.displayProfile;
      } else {
        displayProfile = FindUser?.displayProfile;
      }

      let isDelivered =
        userOnline === null ? false : userOnline.isOnline ? true : false;
      if (findQuestion) {
        const FindAswer = await global.models.GLOBAL.ANSWER.findOne({
          question: findQuestion._id,
          createdBy: ObjectId(user.id),
        }).sort({ createdAt: -1 });

        if (!FindAswer) {
          const updatedQue =
            await global.models.GLOBAL.QUESTION.findOneAndUpdate(
              { _id: findQuestion._id },
              { $inc: { room: 1 } },
              { new: true }
            );
        }
        if (isGroup) {
          if (findQuestion.createdBy != user.id) {
            const findAnswer = await global.models.GLOBAL.ANSWER.findOne({
              roomId: roomId,
              createdBy: user.id,
            }).sort({ createdAt: -1 });

            const FindRoomAnswer = await global.models.GLOBAL.ANSWER.findOne({
              roomId: roomId,
            }).sort({ tag: -1 });

            if (findAnswer) {
              AnswerTag = findAnswer.tag;
            } else {
              if (FindRoomAnswer) {
                AnswerTag = FindRoomAnswer.tag + 1;
              } else {
                AnswerTag = 1;
              }
            }
          }

          let findRoom = await global.models.GLOBAL.ANSWER_GROUP.findOne({
            _id: roomId,
          });

          const CheckUserFound =
            await global.models.GLOBAL.ANSWER_GROUP.findOne({
              questionId: question,
            })
              .where("participateIds._id")
              .equals(ObjectId(user.id));

          if (!CheckUserFound) {
            const updateGroup =
              await global.models.GLOBAL.ANSWER_GROUP.updateOne(
                { questionId: question },
                {
                  $push: {
                    participateIds: {
                      _id: ObjectId(user.id),
                      createdAt: new Date(),
                    },
                  },
                }
              );
          }

          if (findRoom) {
            let addAnswer;
            addAnswer = {
              roomId: roomId,
              answer: answer,
              createdBy: user.id,
              question: question,
              isGroup: isGroup,
              type: type,
              createdAt: Date.now(),
              sentTo: [findQuestion.createdBy],
              deliveredTo: isDelivered ? [findQuestion.createdBy] : [],
              status: status,
              user_type: user_type,
              tag: AnswerTag,
              displayProfile: displayProfile,
            };

            // if (flag == "seen") {
            //   addAnswer.seenBy = [findQuestion.createdBy];
            // }
            let addNewAnswer = await global.models.GLOBAL.ANSWER.create(
              addAnswer
            );
            // let updateAnswer = await global.models.GLOBAL.ANSWER.updateMany
            let lastMessageObj = {
              answerId: addNewAnswer._id,
              answer: addNewAnswer.answer,
              createdAt: Date.now(),
            };
            newAnswer = await global.models.GLOBAL.ANSWER.findOne({
              _id: addNewAnswer._id,
            }).populate({
              path: "createdBy",
              model: "user",
              select:
                "_id name subject profileImage currentRole countryOfResidence",
            });
            let addLastMessage =
              await global.models.GLOBAL.ANSWER_GROUP.findOneAndUpdate(
                {
                  _id: roomId,
                },
                { $set: { lastMessage: lastMessageObj } },
                { new: true }
              );
            const updatedQue = await global.models.GLOBAL.QUESTION.updateOne(
              { _id: question, group: isGroup ? "Everyone" : "Author" },
              { $inc: { response: 1 } },
              { new: true }
            );

            await global.models.GLOBAL.USER.findOneAndUpdate(
              { _id: user.id },
              {
                $pull: {
                  answerLater: question,
                },
              }
            );

            const updateQuestion =
              await global.models.GLOBAL.QUESTION.findOneAndUpdate(
                {
                  _id: question,
                },
                {
                  $set: {
                    new: 1,
                  },
                }
              );

            if (user.id != findQuestion.createdBy.toString()) {
              // console.log(
              //   user.id,
              //   findQuestion.createdBy,
              //   "-----------------vishv----------"
              // );

              let ntfObj = {
                userId: user.id,
                receiverId: findQuestion.createdBy,
                title: `Notification By ${user.id} to ${findQuestion.createdBy}`,
                description: {
                  data: { title: "Leaderbridge" },
                  notification: {
                    title: `A user gave an answer to your question!`,
                    body: `${
                      FindUser.subject[0]
                    } Replied To Your Question ${findQuestion.question.substring(
                      0,
                      50
                    )}`,
                  },
                },
                createdBy: user.id,
                updatedBy: user.id,
                question: findQuestion._id,
                createdAt: Date.now(),
              };

              let notification = await global.models.GLOBAL.NOTIFICATION.create(
                ntfObj
              );
              console.log("ntfObjntfObjntfObjntfObjntfObjntfObj", ntfObj);

              let findToken = await global.models.GLOBAL.USER.findOne({
                _id: findQuestion.createdBy,
              });

              try {
                if (findToken.deviceToken) {
                  let data = {
                    payload: ntfObj.description,
                    firebaseToken: findToken.deviceToken,
                  };

                  sendPushNotification(data);
                  // res?.status(200).send({
                  //   msg: "Notification sent successfully!",
                  // });
                }
                // res.status(200).send({
                //   msg: "Notification sent successfully!",
                // });
              } catch (e) {
                // res.status(500).send({
                //   msg: "Unable to send notification!",
                // });
              }
            } else {
              console.log("findRoomfindRoomfindRoom", roomId);

              const FindRoom = await global.models.GLOBAL.ANSWER_GROUP.findOne({
                _id: roomId,
              }).select("participateIds");

              console.log("findParticipantsfindParticipants", FindRoom);

              const FilterID = FindRoom.participateIds.filter(
                (item) => item._id.toString() != user.id
              );

              const PushNotificationData = new Promise(
                async (resolve, reject) => {
                  const FilterIDNotification = FilterID.map(async (item) => {
                    let ntfObj2 = {
                      userId: user.id,
                      receiverId: item?._id,
                      title: `Notification By ${findQuestion.createdBy} to ${item?._id}`,
                      description: {
                        data: { title: "Leaderbridge" },
                        notification: {
                          title: `A user gave an answer to your question`,
                          body: `${
                            FindUser.subject[0]
                          }  Replied on your response on "${findQuestion.question.substring(
                            0,
                            50
                          )}${findQuestion.question.length > 50 ? "..." : ""}"`,
                        },
                      },
                      createdBy: user.id,
                      updatedBy: user.id,
                      question: question,
                      createdAt: Date.now(),
                    };

                    let findToken = await global.models.GLOBAL.USER.findOne({
                      _id: item?._id,
                    });
                    let notification =
                      await global.models.GLOBAL.NOTIFICATION.create(ntfObj2);
                    console.log(
                      "ntfObj2ntfObj2ntfObj2ntfObj2ntfObj2ntfObj2",
                      findToken
                    );
                    try {
                      if (findToken.deviceToken !== "1234") {
                        let data = {
                          payload: ntfObj2.description,
                          firebaseToken: findToken.deviceToken,
                        };
                        sendPushNotification(data);
                      }
                    } catch (e) {
                      console.log("e--->>", e);
                    }
                  });
                }
              ).then(async (data) => {
                resolve(data);
              });
            }

            let findAnswer1 = await global.models.GLOBAL.ANSWER.find({
              roomId: roomId,
              createdBy: ObjectId(user.id),
            });
            let findAnswer2 = await global.models.GLOBAL.ANSWER.find({
              roomId: roomId,
              // createdBy: ObjectId("636b74617a3ce63a87b81331") ,
              createdBy: ObjectId(findQuestion.createdBy),
            });

            let CheckConnection =
              findAnswer1 &&
              findAnswer1.length > 0 &&
              findAnswer2 &&
              findAnswer2.length > 0
                ? true
                : false;

            const FindAswer = await global.models.GLOBAL.ANSWER.findOne({
              question: findQuestion._id,
              createdBy: ObjectId(user.id),
            }).sort({ createdAt: -1 });

            if (!FindAswer) {
              const updatedQue =
                await global.models.GLOBAL.QUESTION.findOneAndUpdate(
                  { _id: findQuestion._id },
                  { $inc: { room: 1 } },
                  { new: true }
                );
            }

            const data4createResponseObject = {
              // req: req,
              result: 0,
              message: messages.ITEM_INSERTED,
              payload: {
                answer: newAnswer,
                CheckConnection: CheckConnection,
                userId: user.id,
              },
              logPayload: false,
            };
            return data4createResponseObject;
          } else {
            const data4createResponseObject = {
              // req: req,
              result: -1,
              message: messages.ITEM_NOT_FOUND,
              payload: {},
              logPayload: false,
            };
            return data4createResponseObject;
          }
        } else {
          let findRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
            _id: roomId,
          });
          if (findRoom) {
            let findAnswer = await global.models.GLOBAL.ANSWER.findOne({
              roomId: ObjectId(roomId),
              question: ObjectId(question),
            }).sort({ createdAt: -1 });

            let addAnswer;
            addAnswer = {
              roomId: roomId,
              answer: answer,
              createdBy: user.id,
              question: question,
              isGroup: isGroup,
              type: type,
              createdAt: Date.now(),
              sentTo: [findQuestion.createdBy],
              deliveredTo: isDelivered ? [findQuestion.createdBy] : [],
              status: status,
              user_type: user_type,
              displayProfile: displayProfile,
            };

            // if (flag == "seen") {
            //   addAnswer.seenBy = [findQuestion.createdBy];
            // }
            let addNewAnswer = await global.models.GLOBAL.ANSWER.create(
              addAnswer
            );
            // let updateAnswer = await global.models.GLOBAL.ANSWER.updateMany
            let lastMessageObj = {
              answerId: addNewAnswer._id,
              answer: addNewAnswer.answer,
              createdAt: Date.now(),
            };
            newAnswer = await global.models.GLOBAL.ANSWER.findOne({
              _id: addNewAnswer._id,
            }).populate({
              path: "createdBy",
              model: "user",
              select:
                "_id name subject profileImage currentRole countryOfResidence",
            });
            let addLastMessage =
              await global.models.GLOBAL.ANSWER_ROOM.findOneAndUpdate(
                {
                  _id: roomId,
                },
                { $set: { lastMessage: lastMessageObj } },
                { new: true }
              );
            const updatedQue = await global.models.GLOBAL.QUESTION.updateOne(
              { _id: question, group: isGroup ? "Everyone" : "Author" },
              { $inc: { response: 1 } },
              { new: true }
            );

            await global.models.GLOBAL.USER.findOneAndUpdate(
              { _id: user.id },
              {
                $pull: {
                  answerLater: question,
                },
              }
            );

            const updateQuestion =
              await global.models.GLOBAL.QUESTION.findOneAndUpdate(
                {
                  _id: question,
                },
                {
                  $set: {
                    new: 1,
                  },
                }
              );

            if (user.id != findQuestion.createdBy.toString()) {
              // console.log(
              //   user.id,
              //   findQuestion.createdBy,
              //   "-----------------vishv----------"
              // );

              let ntfObj = {
                userId: user.id,
                receiverId: findQuestion.createdBy,
                title: `Notification By ${user.id} to ${findQuestion.createdBy}`,
                description: {
                  data: { title: "Leaderbridge" },
                  notification: {
                    title: `A user gave an answer to your question!`,
                    body: `${
                      FindUser.subject[0]
                    } Replied To Your Question "${findQuestion.question.substring(
                      0,
                      50
                    )}"`,
                  },
                },
                createdBy: user.id,
                updatedBy: user.id,
                question: question,
                createdAt: Date.now(),
              };

              let findToken = await global.models.GLOBAL.USER.findOne({
                _id: findQuestion.createdBy,
              });
              let notification = await global.models.GLOBAL.NOTIFICATION.create(
                ntfObj
              );

              try {
                if (findToken.deviceToken) {
                  let data = {
                    payload: ntfObj.description,
                    firebaseToken: findToken.deviceToken,
                  };

                  sendPushNotification(data);
                  // res?.status(200).send({
                  //   msg: "Notification sent successfully!",
                  // });
                }
                // res.status(200).send({
                //   msg: "Notification sent successfully!",
                // });
              } catch (e) {
                // res.status(500).send({
                //   msg: "Unable to send notification!",
                // });
              }
            } else {
              const FindRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
                _id: roomId,
              }).select("participateIds");

              console.log("findParticipantsfindParticipants", FindRoom);

              const FilterID = FindRoom.participateIds.filter(
                (item) =>
                  item.toString() != user.id && item.toString() != question
              );

              const PushNotificationData = new Promise(
                async (resolve, reject) => {
                  const FilterIDNotification = FilterID.map(async (item) => {
                    let ntfObj2 = {
                      userId: user.id,
                      receiverId: item,
                      title: `Notification By ${findQuestion.createdBy} to ${item}`,
                      description: {
                        data: { title: "Leaderbridge" },
                        notification: {
                          title: `A user gave an answer to your question`,
                          body: `${
                            FindUser.subject[0]
                          }  Replied on your response on  "${findQuestion.question.substring(
                            0,
                            50
                          )}${findQuestion.question.length > 50 ? "..." : ""}"`,
                        },
                      },
                      createdBy: user.id,
                      updatedBy: user.id,
                      question: question,
                      createdAt: Date.now(),
                    };

                    let findToken = await global.models.GLOBAL.USER.findOne({
                      _id: item,
                    });
                    let notification =
                      await global.models.GLOBAL.NOTIFICATION.create(ntfObj2);
                    console.log("QQQQQQQQQQQQQQQQQQQQ", findToken);
                    try {
                      if (findToken.deviceToken !== "1234") {
                        let data = {
                          payload: ntfObj2.description,
                          firebaseToken: findToken.deviceToken,
                        };
                        sendPushNotification(data);
                      }
                    } catch (e) {
                      console.log("e--->>", e);
                    }
                  });
                }
              ).then(async (data) => {
                resolve(data);
              });
            }

            let findAnswer1 = await global.models.GLOBAL.ANSWER.find({
              roomId: roomId,
              createdBy: ObjectId(user.id),
            });
            let findAnswer2 = await global.models.GLOBAL.ANSWER.find({
              roomId: roomId,
              // createdBy: ObjectId("636b74617a3ce63a87b81331") ,
              createdBy: ObjectId(findQuestion.createdBy),
            });

            let CheckConnection =
              findAnswer1 &&
              findAnswer1.length > 0 &&
              findAnswer2 &&
              findAnswer2.length > 0
                ? true
                : false;

            const data4createResponseObject = {
              // req: req,
              result: 0,
              message: messages.ITEM_INSERTED,
              payload: {
                answer: newAnswer,
                CheckConnection: CheckConnection,
                userId: user.id,
              },
              logPayload: false,
            };
            return data4createResponseObject;
          } else {
            const data4createResponseObject = {
              // req: req,
              result: -1,
              message: messages.ITEM_NOT_FOUND,
              payload: {},
              logPayload: false,
            };
            return data4createResponseObject;
          }
        }
      }
    } catch (error) {
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
    }
  },
};
