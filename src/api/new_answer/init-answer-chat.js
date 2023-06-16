const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const mongoose = require("mongoose");
const logger = require("../../logger");
const utils = require("../../utils");
const ObjectId = require("mongodb").ObjectId;

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  //  route validation
  validation: Joi.object({
    questionId: Joi.string().required(),
    isGroup: Joi.boolean().required(),
  }),
  // route handler
  handler: async (req, res) => {
    const { questionId, isGroup } = req.body;
    try {
      // console.log("this calleddddddd");

      if (!questionId && (isGroup == true || isGroup == false)) {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.INITIATION_FAILED,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      }

      const { user } = req;

      console.log("AAAAAASSSSSSSSSSSWWWWWWWWW", questionId);
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: questionId,
      });

      if (findQuestion) {
        let participateIds = [];
        // check user type
        participateIds.push(user._id);
        participateIds.push(findQuestion._id);
        participateIds.push(findQuestion.createdBy);

        console.log("GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG", participateIds);

        let chatRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
          privacy: "private",
          participateIds: {
            $size: participateIds.length,
            $all: [...participateIds],
          },
        });

        if (isGroup == true) {
          const findGroup = await global.models.GLOBAL.ANSWER_GROUP.findOne({
            questionId: questionId,
          });

          if (findGroup) {
            const CheckUserFound =
              await global.models.GLOBAL.ANSWER_GROUP.findOne({
                questionId: questionId,
              })
                .where("participateIds._id")
                .equals(ObjectId(user._id));

            if (!CheckUserFound) {
              const updateGroup =
                await global.models.GLOBAL.ANSWER_GROUP.updateOne(
                  { questionId: questionId },
                  {
                    $push: {
                      participateIds: {
                        _id: user._id,
                        createdAt: new Date(),
                      },
                    },
                  }
                );
            } else {
              const data4createResponseObject = {
                req: req,
                result: 0,
                message: messages.INITIATION_SUCCESS,
                payload: { chatRoom: CheckUserFound },
                logPayload: false,
              };
              return res
                .status(enums.HTTP_CODES.OK)
                .json(utils.createResponseObject(data4createResponseObject));
            }
          } else {
            let GroupparticipateIds = [];
            GroupparticipateIds.push({
              _id: user._id,
              createdAt: new Date(),
            });
            GroupparticipateIds.push({
              _id: findQuestion.createdBy,
              createdAt: new Date(),
            });

            let RoomID = {
              participateIds: GroupparticipateIds,
              questionId: questionId,
              createdAt: new Date(),
              createdBy: findQuestion.createdBy,
            };

            const CreateGroup = await global.models.GLOBAL.ANSWER_GROUP.create(
              RoomID
            );

            const data4createResponseObject = {
              req: req,
              result: 0,
              message: messages.INITIATION_SUCCESS,
              payload: { chatRoom: CreateGroup },
              logPayload: false,
            };
            return res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          }
        } else if (isGroup == false) {
          if (chatRoom) {
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
          } else {
            let roomObj = {
              participateIds: participateIds,
              questionId: questionId,
              createdAt: Date.now(),
              privacy: findQuestion?.group == "Author" ? "private" : "public",
              createdBy: user._id,
            };

            // const updatedQue = await global.models.GLOBAL.QUESTION.updateOne(
            //   { _id: questionId, createdBy: { $nin: user.id } },
            //   { $inc: { room: 1 } },
            //   { new: true }
            // );

            await global.models.GLOBAL.ANSWER_ROOM.create(roomObj);

            chatRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
              privacy: "private",
              participateIds: {
                $size: participateIds.length,
                $all: [...participateIds],
              },
            });

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
      }
    } catch (error) {
      console.log(
        "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
        error
      );
      // logger.error(
      //   `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
      // );
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
