const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const { getHeaderFromToken } = require("../../utils");
const utils = require("../../utils");

// Retrieve and return all Chats for particular user from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const userData = await getHeaderFromToken(user);
    // console.log("userDatauserDatauserData", userData);
    try {
      let count = await global.models.GLOBAL.NOTIFICATION.find({
        receiverId: userData.id,
        status: true,
      });
      // console.log("countcount", count.length);

      const data4createResponseObject = {
        // req: req,
        result: 0,
        message: messages.ITEM_FETCHED,
        payload: {
          count: count.length,
        },
        logPayload: false,
      };
      // return res
      //   .status(enums.HTTP_CODES.OK)
      //   .json(utils.createResponseObject(data4createResponseObject));
      return data4createResponseObject;
    } catch (error) {
      // logger.error(
      //   `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
      // );
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      // return res
      //   .status(enums.HTTP_CODES.BAD_REQUEST)
      //   .json(utils.createResponseObject(data4createResponseObject));
      return data4createResponseObject;
    }
  },
};
