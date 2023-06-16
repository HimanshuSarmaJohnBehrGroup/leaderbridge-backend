const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");
const { ObjectId } = require("mongodb");

// Get User by ID
module.exports = exports = {
  handler: async (req, res) => {
    let { userId, status } = req.body;
    // console.log("reqetuyetuyetuyetuy--->>", req);

    try {
      if (userId) {
        let updateChat = await global.models.GLOBAL.CHAT.updateMany(
          { sentTo: ObjectId(userId), deliveredTo: { $nin: ObjectId(userId) } },
          { $addToSet: { deliveredTo: ObjectId(userId) } }
        );
        let findUser = await global.models.GLOBAL.USER.findByIdAndUpdate(
          userId,
          {
            $set: {
              isOnline: status,
            },
          },
          {
            new: true,
          }
        );
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.USER_FETCH_SUCCESS,
          payload: findUser,
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    } catch (error) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.GENERAL,
        payload: error.message,
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
