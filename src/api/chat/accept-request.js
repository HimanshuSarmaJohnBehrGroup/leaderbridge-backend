const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const { sendPushNotification } = require("../../middlewares/pushNotification");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    let user = await utils.getHeaderFromToken(req.user);
    // console.log("id-----d-d-d-d", req.status);
    const { requestId, id } = req;
    if (!requestId) {
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
      const findRequest =
        await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findOne({
          _id: requestId,
        });

      if (findRequest) {
        if (req.status != "revoked") {
          let updateRequest =
            await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.findByIdAndUpdate(
              {
                _id: requestId,
              },
              {
                $set: {
                  status: req.status == "revoked" ? "revoked" : "accepted",
                  acceptedAT: Date.now(),
                  acceptedBy: user.id,
                },
              },
              {
                new: true,
              }
            );

          // if (req.Notification == "")
          if (req.Notification) {
            let notificationMsg;
            if (req.Notification == "request") {
              notificationMsg = `Your Chat Request is Accepted by ${user.subject[0]}`;
            } else if (req.Notification == "audio") {
              notificationMsg = `${user.subject[0]} accepted your audio call request`;
            } else if (req.Notification == "video") {
              notificationMsg = `${user.subject[0]} accepted your video call request`;
            }

            // if (notificationMsg) {
            let ntfObj = {
              userId: user.id,
              receiverId: findRequest.requestBy,
              title: `Notification By ${user.id} to ${findRequest.requestBy}`,
              description: {
                data: { title: "Leaderbridge" },
                notification: {
                  title: "Accept Request!!!",
                  body: notificationMsg,
                },
              },
              createdBy: user.id,
              updatedBy: user.id,
              createdAt: Date.now(),
            };

            let findToken = await global.models.GLOBAL.USER.findOne({
              _id: findRequest.requestBy,
            });

            let notification = await global.models.GLOBAL.NOTIFICATION.create(
              ntfObj
            );
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
          }
          const data4createResponseObject = {
            // req: req,
            result: 0,
            message: messages.ITEM_UPDATED,
            payload: { updateRequest },
            logPayload: false,
          };
          return data4createResponseObject;
        } else {
          let newRequestObj = {
            requestBy: user.id,
            requestTo: id,
            // questionId: questionId,
            status: req.status == "revoked" ? "revoked" : "accepted",
            createdAt: Date.now(),
            roomId: findRequest?.roomId,
            typeOfRequest:
              findRequest?.typeOfRequest == "requestAudioAccess"
                ? "revokeAudioAccess"
                : "revokeVideoAccess",
          };
          let newRequest =
            await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.create(
              newRequestObj
            );

          const data4createResponseObject = {
            // req: req,
            result: 0,
            message: messages.ITEM_UPDATED,
            payload: { updateRequest },
            logPayload: false,
          };
          return data4createResponseObject;
        }

        // }

        //   .status(enums.HTTP_CODES.OK)
        //   .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          // req: req,
          result: -1,
          message: messages.NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        return data4createResponseObject;
        //   .status(enums.HTTP_CODES.NOT_FOUND)
        //   .json(utils.createResponseObject(data4createResponseObject));
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
