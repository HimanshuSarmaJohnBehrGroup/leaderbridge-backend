const Joi = require("joi");
const { ObjectID } = require("mongodb");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    let user = await utils.getHeaderFromToken(req.user);

    const { requestId, questionId, type, receiverId, owner } = req;
    if (!requestId || !questionId) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
      // .status(enums.HTTP_CODES.BAD_REQUEST)
      // .json(utils.createResponseObject(data4createResponseObject));
    }

    try {
      const findRequest =
        await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findOne({
          _id: requestId,
        });
      if (findRequest) {
        let updateRequest =
          await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findByIdAndUpdate(
            {
              _id: requestId,
            },
            {
              $set: {
                status: "accepted",
                acceptedAT: Date.now(),
                acceptedBy: user.id,
                owner: owner,
              },
            },
            {
              new: true,
            }
          );

        if (!type && type != "private") {
          if (updateRequest) {
            await global.models.GLOBAL.QUESTION.findByIdAndUpdate(
              { _id: questionId },
              {
                $set: {
                  displayProfile: true,
                },
              },
              { new: true }
            );
          }
        }

        if (type && type == "private") {
          let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
            _id: questionId,
          });

          if (findQuestion) {
            let participateIds = [];
            // check user type
            if (findQuestion.createdBy == user.id) {
              participateIds.push(receiverId);
              participateIds.push(questionId);
              participateIds.push(user.id);
            } else {
              participateIds.push(user.id);
              participateIds.push(questionId);
              participateIds.push(findQuestion.createdBy);
            }

            let chatRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
              participateIds: {
                $size: participateIds.length,
                $all: [...participateIds],
              },
            });

            if (!chatRoom) {
              updateRequest = await global.models.GLOBAL.ANSWER_ROOM.create({
                participateIds: participateIds,
                questionId: questionId,
                createdBy: user.id,
                privacy: "private",
                createdAt: Date.now(),
              });
            } else {
              updateRequest =
                await global.models.GLOBAL.ANSWER_ROOM.findByIdAndUpdate(
                  {
                    _id: chatRoom._id,
                  },
                  {
                    $set: {
                      privacy: "private",
                    },
                  },
                  {
                    new: true,
                  }
                ).populate({
                  path: "createdBy",
                  model: "user",
                  select:
                    "_id name subject profileImage currentRole email blockUser region",
                });
            }
          }

          // let updateAnswer =
          //   await global.models.GLOBAL.ANSWER_ROOM.findOneAndUpdate(
          //     { _id: findRequest.roomId },
          //     {
          //       $set: {
          //         privacy: "private",
          //       },
          //     },
          //     { new: true }
          //   );
        }

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_UPDATED,
          payload: { updateRequest },
          logPayload: false,
        };
        return data4createResponseObject;
        // .status(enums.HTTP_CODES.OK)
        // .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        return data4createResponseObject;
        //     .status(enums.HTTP_CODES.NOT_FOUND)
        //     .json(utils.createResponseObject(data4createResponseObject));
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
      // .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
      // .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
