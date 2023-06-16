const mongoose = require("mongoose");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const { generateName, generateName2 } = require("../../auth/uniqueName");

const logger = require("../../logger");
const { sendPushNotification } = require("../../middlewares/pushNotification");
const { getHeaderFromToken } = require("../../utils");
const utils = require("../../utils");

module.exports = exports = {
  //Router Handler
  handler: async ({ user, receiverId, unknownName }) => {
    // const { user } = req;
    // const { accepted } = req.query;
    // const { receiverId } = req.params;
    // console.log(
    //   "ffffffffffff-----111111111111111111111111111111111111111",
    //   receiverId
    // );
    const userData = await getHeaderFromToken(user);
    // console.log("userData============", userData);
    if (!receiverId) {
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

    const uniqueName1 = generateName();
    const uniqueName2 = generateName2();

    // console.log(
    //   "ffffffffffff-----2222222222222222222222222222222222222222222222"
    // );
    let findUser = await global.models.GLOBAL.USER.find({
      _id: userData.id,
    });

    if (findUser.length > 0) {
      // console.log(
      //   "ffffffffffff-----2222222222222222222222222222222222222222222222333",
      //   findUser
      // );
      //   try {
      // const { connectionId } = req.body

      const updatedConnectedData2 =
        await global.models.GLOBAL.USER.findOneAndUpdate(
          {
            $and: [
              { _id: mongoose.Types.ObjectId(userData.id) },
              { "accepted._id": mongoose.Types.ObjectId(receiverId) },
            ],
          },
          { $set: { "accepted.$.unknownName": unknownName } },
          { new: true }
        );
      //   model.update(
      //     { _id: 1, "items.id": "2" },
      //     {
      //       $set: {
      //         "items.$.name": "yourValue",
      //         "items.$.value": "yourvalue",
      //       },
      //     }
      //   );

      console.log("AAAASSSDDDFFFGFGGG", updatedConnectedData2);

      // Item.updateMany(
      //   { "path._id": update._id },
      //   { $set: { "path.$[element].name": update.newName } },
      //   {
      //     arrayFilters: [
      //       { "element._id": mongoose.Types.ObjectId(update._id) },
      //     ],
      //   }
      // );

      const data4createResponseObject = {
        // req: req,
        result: 0,
        message: messages.ITEM_UPDATED,
        payload: { myConnection: updatedConnectedData2[0]?.conected },
        logPayload: false,
      };
      return data4createResponseObject;
      //   } catch (error) {
      //     const data4createResponseObject = {
      //       // req: req,
      //       result: -1,
      //       message: messages.GENERAL,
      //       payload: {},
      //       logPayload: false,
      //     };
      //     // res
      //     //   .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
      //     //   .json(utils.createResponseObject(data4createResponseObject));
      //     return data4createResponseObject;
      //   }
    }
  },
};
