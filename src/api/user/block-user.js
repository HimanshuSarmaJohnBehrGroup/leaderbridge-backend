const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const { getHeaderFromToken } = require("../../utils");

module.exports = exports = {
  //Router Handler
  handler: async ({ user, userId }) => {
    const userData = await getHeaderFromToken(user);
    // console.log("userData", userId);

    //Check userId is not null
    if (!userData || !userId) {
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
    }
    let findUser = await global.models.GLOBAL.USER.findById(userData.id);

    if (findUser) {
      try {
        const updatedBlockUserList =
          await global.models.GLOBAL.USER.findOneAndUpdate(
            { _id: userData.id },
            {
              $addToSet: {
                blockUser: userId,
              },
            },
            { new: true }
          );

        // console.log("updatedBlockUserList", updatedBlockUserList);
        const data4createResponseObject = {
          // req: req,
          result: 0,
          message: messages.USER_BLOCK,
          payload: { blockUser: updatedBlockUserList.blockUser },
          logPayload: false,
        };
        return data4createResponseObject;
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
    } else {
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.NOT_FOUND,
        payload: {},
        logPayload: false,
      };
      return data4createResponseObject;
    }
  },
};
