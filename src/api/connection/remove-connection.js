const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const { getHeaderFromToken } = require("../../utils");
const { ObjectID } = require("mongodb");
module.exports = exports = {
  //Router Handler
  handler: async ({ user, remove, removeId }) => {
    const userData = await getHeaderFromToken(user);
    if (!removeId) {
      const data4createResponseObject = {
        // req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };

      return data4createResponseObject;
      // return res
      //   .status(enums.HTTP_CODES.BAD_REQUEST)
      //   .json(utils.createResponseObject(data4createResponseObject));
    }
    if (remove) {
      let findUser = await global.models.GLOBAL.USER.find({
        _id: userData.id,
      });
      if (findUser.length > 0) {
        try {
          let removeConnection =
            await global.models.GLOBAL.USER.findOneAndUpdate(
              { _id: userData.id },
              {
                $pull: {
                  accepted: { _id: ObjectID(removeId) },
                },
              },
              { new: true }
            );
          await global.models.GLOBAL.USER.findOneAndUpdate(
            { _id: removeId },
            {
              $pull: {
                accepted: { _id: ObjectID(userData.id) },
              },
            },
            { new: true }
          );
          if (removeConnection) {
            const data4createResponseObject = {
              // req: req,
              result: 0,
              message: messages.ITEM_UPDATED,
              payload: {},
              logPayload: false,
            };

            return data4createResponseObject;
          } else {
            const data4createResponseObject = {
              // req: req,
              result: -1,
              message:
                "Something Went wrong to remove Connection, Please Try Agin later",
              payload: {},
              logPayload: false,
            };
            return data4createResponseObject;
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
      }
    }
  },
};
