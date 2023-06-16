const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  //Router Handler
  handler: async ({ user, userId }) => {
    // console.log("userId:UnBlock", userId);
    const userData = await utils.getHeaderFromToken(user);
    if (!userId) {
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };
      // return res
      //   .status(enums.HTTP_CODES.BAD_REQUEST)
      //   .json(utils.createResponseObject(data4createResponseObject));
      return data4createResponseObject;
    }
    let findUser = await global.models.GLOBAL.USER.findById(userId);
    if (findUser) {
      try {
        const updatedBlockUserList =
          await global.models.GLOBAL.USER.findOneAndUpdate(
            { _id: userData.id },
            {
              $pull: {
                blockUser: userId,
              },
            },
            { new: true }
          );
        const data4createResponseObject = {
          // req: req,
          result: 0,
          message: messages.USER_UNBLOCK,
          payload: { blockUser: updatedBlockUserList.blockUser },
          logPayload: false,
        };
        return data4createResponseObject;
      } catch (error) {
        const data4createResponseObject = {
          // req: req
          result: -1,
          message: messages.GENERAL,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    } else {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.NOT_FOUND,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
    }
  },
};
