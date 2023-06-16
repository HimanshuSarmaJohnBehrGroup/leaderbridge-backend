const { ObjectID } = require("bson");
const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const { sendPushNotification } = require("../../middlewares/pushNotification");
const utils = require("../../utils");

// Add Answer
module.exports = exports = {
  // route handler
  handler: async ({ user, id, roomId, typeOfRequest }) => {
    let userData = await utils.getHeaderFromToken(user);

    if (!id) {
      const data4createResponseObject = {
        // req: req,
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
      let findUser = await global.models.GLOBAL.USER.findOne({
        _id: id,
      });

      if (findUser) {
        let newRequestObj = {
          requestBy: userData.id,
          requestTo: id,
          // questionId: questionId,
          createdAt: Date.now(),
          roomId: roomId,
          typeOfRequest: typeOfRequest,
        };
        let newRequest =
          await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.create(
            newRequestObj
          );

        let notificationMsg;
        if (
          typeOfRequest == "requestProfileAccess" ||
          newRequestObj?.typeOfRequest == "requestProfileAccess"
        ) {
          notificationMsg = "You have received a request to view your profile";
        } else if (
          typeOfRequest == "requestAudioAccess" ||
          newRequestObj?.typeOfRequest == "requestAudioAccess"
        ) {
          notificationMsg = "You have received a request for audio call.";
        } else if (
          typeOfRequest == "requestVideoAccess" ||
          newRequestObj?.typeOfRequest == "requestVideoAccess"
        ) {
          notificationMsg = "You have received a request for video call.";
        }

        let Notification = {
          userId: userData.id,
          receiverId: id,
          notificationMsg: notificationMsg,
        };
        let ntfObj = {
          userId: userData.id,
          receiverId: id,
          title: `Notification By ${userData.id} to ${id}`,
          description: {
            data: { title: "Leaderbridge" },
            notification: {
              title: "New Request!!!",
              body: notificationMsg,
            },
          },
          createdBy: userData.id,
          updatedBy: userData.id,
          createdAt: Date.now(),
        };
        let findToken = await global.models.GLOBAL.USER.findOne({
          _id: id,
        });
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
        // res.status(200).send({
        //   msg: "Notification sent successfully!",
        // });
        // } catch (e) {
        //   res.status(500).send({
        //     msg: "Unable to send notification!",
        //   });
        // }
        let notification = await global.models.GLOBAL.NOTIFICATION.create(
          ntfObj
        );

        const data4createResponseObject = {
          // req: req,
          result: 0,
          message: "Requested Successfully.",
          payload: { newRequest },
          logPayload: false,
        };
        return data4createResponseObject;
        // .status(enums.HTTP_CODES.OK)
        // .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          // req: req,
          result: -1,
          message: messages.GENERAL,
          payload: {},
          logPayload: false,
        };
        return data4createResponseObject;
        // .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        // .json(utils.createResponseObject(data4createResponseObject));
      }
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
      return data4createResponseObject;
      // .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
      // .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
