const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  //Router Handler
  handler: async (req, res) => {
    // console.log("userId:UnBlock", userId);
    const { id } = req.query;
    if (!id) {
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
    let findUser = await global.models.GLOBAL.USER.findById(id);
    console.log("QQQQQQQQQQQQQQQQ", findUser);
    if (findUser) {
      try {
        const updatedBlockUserList =
          await global.models.GLOBAL.USER.findOneAndUpdate(
            { _id: id },
            {
              $set: {
                fullyVerifiedSkip: true,
              },
            },
            { new: true }
          );
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: "user is successfully skip the verified ",
          payload: { blockUser: updatedBlockUserList.fullyVerifiedSkip },
          logPayload: false,
        };
        res
          .status(200)
          .json(utils.createResponseObject(data4createResponseObject));
      } catch (error) {
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
