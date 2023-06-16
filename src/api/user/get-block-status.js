const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const { getHeaderFromToken } = require("../../utils");
const utils = require("../../utils");
// Retrieve and return all Block-user List from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user, userId, roomId, questionId, isGroup } = req;
    // const userData = await getHeaderFromToken(user);
    try {
      console.log("AAAAAAAAAAAQQQQQQQQQ", questionId);
      if (userId) {
        if (roomId) {
          let question = await global.models.GLOBAL.QUESTION.findOne({
            _id: questionId,
          });

          console.log("roomIdroomIdroomId", roomId);

          if (!question) {
            const data4createResponseObject = {
              req: req,
              result: -1,
              message: messages.INVALID_PARAMETERS,
              payload: {},
              logPayload: false,
            };
            return data4createResponseObject;
          }

          console.log("questionquestionquestion", question?.group, question);
          let Group = question?.group == "Everyone" ? true : false;
          console.log("AAAAAAAAAQQQQQQQQQQQQQQQQQQQQQ", Group, roomId);

          let FindRoom;
          if (isGroup) {
            FindRoom = await global.models.GLOBAL.ANSWER_GROUP.findOne({
              _id: roomId,
            });
          } else {
            FindRoom = await global.models.GLOBAL.ANSWER_ROOM.findOne({
              _id: roomId,
            });
          }

          console.log("AAAAAAAAAAAAAAQQQ", FindRoom);

          if (question?.createdBy == user) {
            if (FindRoom?.isGroup) {
              const data4createResponseObject = {
                req: req,
                result: 0,
                message: messages.ITEM_FETCHED,
                payload: {
                  isBlocked: "",
                  whoBlocked: false,
                },
                logPayload: false,
              };
              return data4createResponseObject;
            }
          }

          if (!FindRoom) {
            const data4createResponseObject = {
              req: req,
              result: -1,
              message: messages.INVALID_PARAMETERS,
              payload: {},
              logPayload: false,
            };
            return data4createResponseObject;
          }
        }

        let blockUser = await global.models.GLOBAL.USER.find({
          _id: user,
          blockUser: userId,
        });
        blockUser = JSON.parse(JSON.stringify(blockUser));

        console.log("AAQQWWWWWWW", user, userId);

        let checkBlockByMe = await global.models.GLOBAL.USER.findOne({
          $and: [
            {
              _id: user,
            },
            { blockUser: { $in: [userId] } },
          ],
        });

        console.log("FFFFFFFFFFFFFFFFFFFF", checkBlockByMe);
        let checkBlockByOther = await global.models.GLOBAL.USER.findOne({
          $and: [{ _id: userId }, { blockUser: { $in: [user] } }],
        });

        console.log("AAAAAAAAAAQQQQQQQQQQQQ", checkBlockByOther);
        if (checkBlockByMe) {
          // console.log("By Me--->");

          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: {
              isBlocked:
                "You cannot reply to this conversation as you have blocked this user. You can unblock this user from the settings section",
              whoBlocked: true,
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
              isBlocked: "You cannot reply to this conversation",
              whoBlocked: false,
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
              isBlocked: "",
              whoBlocked: false,
            },
            logPayload: false,
          };
          return data4createResponseObject;
        }
        // console.log("CBVCBVCBCBC===================", blockUser.length);
      } else {
        const data4createResponseObject = {
          // req: req,
          result: -1,
          message: messages.INVALID_PARAMETERS,
          payload: {},
          logPayload: false,
        };
        return data4createResponseObject;
      }

      // res
      //   .status(enums.HTTP_CODES.OK)
      //   .json(utils.createResponseObject(data4createResponseObject));
    } catch (error) {
      // logger.error(
      //   `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
      // );
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.GENERAL,
        payload: { error: error.message },
        logPayload: false,
      };
      return data4createResponseObject;
      // res
      //   .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
      //   .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
