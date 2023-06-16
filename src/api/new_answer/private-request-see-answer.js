const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add Answer
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    let user = await utils.getHeaderFromToken(req.user);

    const { id, questionId, owner } = req;

    if (!id) {
      const data4createResponseObject = {
        req: req,
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
      //   // console.log("USER--->>", findUser);
      if (findUser) {
        let newRequestObj = {
          requestBy: user.id,
          requestTo: id,
          createdAt: Date.now(),
          questionId: questionId,
          roomId: req.roomId,
          typeOfRequest: "privateChatRequest",
          owner: owner,
        };

        console.log("RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR", newRequestObj);
        let newRequest =
          await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.create(
            newRequestObj
          );

        let ntfObj = {
          userId: user.id,
          receiverId: id,

          typeof: req.typeof,
          title: `Notification By ${user.id} to ${id}`,
          description: {
            data: { title: "Leaderbridge" },
            notification: {
              title: "New Request profile Access!!!",
              body: `You have received a request to 1-on-1 chat `,
            },
          },
          createdBy: user.id,
          updatedBy: user.id,
          question: questionId,
          createdAt: Date.now(),
        };
        let findToken = await global.models.GLOBAL.USER.findOne({
          _id: id,
        });
        let notification = await global.models.GLOBAL.NOTIFICATION.create(
          ntfObj
        );

        console.log("AAAAAAAAAAAQQQQQQQQQQQQ", findToken);
        try {
          if (findToken.deviceToken !== "1234") {
            let data = {
              payload: ntfObj.description,
              firebaseToken: findToken.deviceToken,
            };
            sendPushNotification(data);
            return (data4createResponseObject = {
              req: req,
              result: 0,
              message: "Notification sent successfully!",
              payload: {},
              logPayload: false,
            });
          }
        } catch (e) {
          return (data4createResponseObject = {
            req: req,
            result: 0,
            message: "Unable to send notification!",
            payload: {},
            logPayload: false,
          });
        }

        if (newRequest) {
          const data4createResponseObject = {
            req: req,
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
            req: req,
            result: -1,
            message: "Sorry, Something went wrong to create new request.",
            payload: {},
            logPayload: false,
          };
          return data4createResponseObject;
          // .status(enums.HTTP_CODES.BAD_REQUEST)
          // .json(utils.createResponseObject(data4createResponseObject));
        }
      } else {
        const data4createResponseObject = {
          req: req,
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
      return data4createResponseObject;
      // .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
      // .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
