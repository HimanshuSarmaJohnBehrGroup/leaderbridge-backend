const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const { sendPushNotification } = require("../../middlewares/pushNotification");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  handler: async (req, res) => {
    const { user } = req;
    const { id } = req.params;
    // console.log("calledddddddddddddd");
    if (!id) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }
    let findCrossMatch = await global.models.GLOBAL.MATCHING.findOne({
      $and: [
        { matchingBy: id },
        { matchingTo: user._id },
        { status: "Pending" },
      ],
    });
    // // console.log("MATCH---->>>", findCrossMatch);
    if (findCrossMatch) {
      try {
        const matchingObj = {
          matchingBy: user._id,
          matchingTo: id,
          status: "Accepted",
        };
        const newMatching = await global.models.GLOBAL.MATCHING.create(
          matchingObj
        );
        await global.models.GLOBAL.MATCHING.findByIdAndUpdate(
          {
            _id: findCrossMatch._id,
          },
          {
            $set: {
              acceptedAt: Date.now(),
              acceptedBy: user._id,
              status: "Accepted",
            },
          },
          { new: true }
        );

        await global.models.GLOBAL.USER.findOneAndUpdate(
          { _id: user._id },
          {
            $addToSet: {
              matched: id,
            },
          },
          { new: true }
        );
        await global.models.GLOBAL.USER.findOneAndUpdate(
          { _id: id },
          {
            $addToSet: {
              matched: user._id,
            },
          },
          { new: true }
        );
        let participateIds = [];
        participateIds.push(user._id);
        participateIds.push(id);

        let chatObj = {
          participateIds: participateIds,
          createdAt: Date.now(),
          createdBy: user._id,
          matchingRoom: true,
        };
        let chatRoom = await global.models.GLOBAL.CHAT_ROOM.create(chatObj);
        let checkBlockByMe = await global.models.GLOBAL.USER.findOne({
          $and: [
            {
              _id: user._id,
            },
            { blockUser: { $in: [id] } },
          ],
        });
        let checkBlockByOther = await global.models.GLOBAL.USER.findOne({
          $and: [{ _id: id }, { blockUser: { $in: [user._id] } }],
        });
        if (checkBlockByMe) {
          let text =
            "You are blocked this user, if you want to unblock this user, please go to setting and unblock this user.";
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.INITIATION_SUCCESS,
            payload: { chatRoom, text },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.NOT_ACCEPTABLE)
            .json(utils.createResponseObject(data4createResponseObject));
        } else if (checkBlockByOther) {
          let text = "You are blocked by this user.";
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.INITIATION_SUCCESS,
            payload: { chatRoom, text },
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.NOT_ACCEPTABLE)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.INITIATION_SUCCESS,
            payload: { chatRoom, newMatching },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));

          let ntfObj = {
            userId: user._id,
            receiverId: id,
            title: `Notification By ${user._id} to ${id}`,
            description: {
              data: { title: "Leaderbridge" },
              notification: {
                title: "Matching Request Accepted!!!",
                body: `${user.subject[0]} accepted your matching request.`,
              },
            },
            createdBy: user._id,
            updatedBy: user._id,
            createdAt: Date.now(),
          };
          let findToken = await global.models.GLOBAL.USER.findOne({
            _id: id,
          });
          let notification = await global.models.GLOBAL.NOTIFICATION.create(
            ntfObj
          );
          try {
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
          } catch (e) {
            // res.status(500).send({
            //   msg: "Unable to send notification!",
            // });
          }

          // // console.log("CHAT-->>", chatRoom);
        }
      } catch (error) {
        logger.error(
          `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
        );
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
      const matchingExist = await global.models.GLOBAL.MATCHING.findOne({
        $and: [{ matchingBy: user._id }, { matchingTo: id }],
      });
      // // console.log("-----------------------------", matchingExist);
      if (matchingExist) {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: "Matching sent successfully.",
          payload: { matchingExist },
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        try {
          const matchingObj = {
            matchingBy: user._id,
            matchingTo: id,
            status: "Pending",
          };
          // // console.log("OBJ--->>", matchingObj);
          // // console.log("OBJ--->>", user._id);
          // // console.log("OBJ--->>", id);
          const newMatching = await global.models.GLOBAL.MATCHING.create(
            matchingObj
          );
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_INSERTED,
            payload: { newMatching },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
          // // console.log("MATCH---->>>", newMatching);
          let ntfObj = {
            userId: user._id,
            receiverId: id,
            title: `Notification By ${user._id} to ${id}`,
            description: {
              data: { title: "Leaderbridge" },
              notification: {
                title: "New Matching Request!!!",
                body: `sent you a matching request.`,
              },
            },
            createdBy: user._id,
            updatedBy: user._id,
            createdAt: Date.now(),
          };
          let findToken = await global.models.GLOBAL.USER.findOne({
            _id: id,
          });
          let notification = await global.models.GLOBAL.NOTIFICATION.create(
            ntfObj
          );
          try {
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
          } catch (e) {
            // res.status(500).send({
            //   msg: "Unable to send notification!",
            // });
          }
        } catch (error) {
          logger.error(
            `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
          );
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
      }
    }
  },
};
