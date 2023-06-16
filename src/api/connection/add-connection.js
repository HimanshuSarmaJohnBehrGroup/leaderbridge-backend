const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const { sendPushNotification } = require("../../middlewares/pushNotification");
const utils = require("../../utils");

module.exports = exports = {
  //Router Handler
  handler: async ({ user, receiverId, message, reason }) => {
    // const { user } = req;
    // const { receiverId } = req.params;
    // console.log(
    //   "heeeeeeeeeeeeeeeeee============>>>>>>add-connection------------------>",
    //   user
    // );

    const userData = await utils.getHeaderFromToken(user);

    if (!receiverId) {
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
    let findConnection = await global.models.GLOBAL.CONNECTION.findOne({
      senderId: userData.id,
      receiverId: receiverId,
    });
    // console.log("request--->>", findConnection);
    if (findConnection !== null) {
      const data4createResponseObject = {
        // req: req,
        result: 0,
        message: messages.ITEM_UPDATED,
        payload: {},
        logPayload: false,
      };
      // return res
      //   .status(enums.HTTP_CODES.OK)
      //   .json(utils.createResponseObject(data4createResponseObject));
      return data4createResponseObject;
    } else {
      let findUser = await global.models.GLOBAL.USER.findById(receiverId);
      if (findUser) {
        try {
          // const { message } = req.body;
          const request = {
            message: message,
            senderId: userData.id,
            receiverId: receiverId,
            requestedAt: Date.now(),
            status: "Pending",
            reason: reason,
          };

          const updatedReceiverData =
            await global.models.GLOBAL.CONNECTION.create(request);

          let ntfObj = {
            userId: userData.id,
            receiverId: receiverId,
            title: `Notification By ${userData.id} to ${receiverId}`,
            description: {
              data: { title: "Leaderbridge" },
              notification: {
                title: "New Connection Request!!!",
                body: `${
                  userData.subject[0] ? userData.subject[0] : ""
                } wants you to join their inner circle `,
              },
            },

            createdBy: userData.id,
            updatedBy: userData.id,
            createdAt: Date.now(),
          };

          let notification = await global.models.GLOBAL.NOTIFICATION.create(
            ntfObj
          );
          let findToken = await global.models.GLOBAL.USER.findOne({
            _id: receiverId,
          });

          const data4createResponseObject = {
            // req: req,
            result: 0,
            message: messages.ITEM_UPDATED,
            payload: { updatedReceiverData },
            logPayload: false,
          };

          return data4createResponseObject;
          // console.log(
          //   "updatedReceiverData------------------------------------>",
          //   updatedReceiverData
          // );

          // try {
          if (findToken.deviceToken !== "1234") {
            let data = {
              payload: ntfObj.description,
              firebaseToken: findToken.deviceToken,
            };

            sendPushNotification(data);

            // res.status(200).send({
            //   msg: "Notification sent successfully!",
            // });
          }
          // return data4createResponseObject;
          // } catch (e) {
          //   res.status(500).send({
          //     msg: "Unable to send notification!",
          //   });
          // }
        } catch (error) {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.GENERAL,
            payload: {},
            logPayload: false,
          };
          return data4createResponseObject;
        }
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: "User dose not Exist.",
          payload: {},
          logPayload: false,
        };
        return data4createResponseObject;
      }
    }
  },
};
