const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const { sendPushNotification } = require("../../middlewares/pushNotification");
const utils = require("../../utils");

// Add Answer
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    let user = await utils.getHeaderFromToken(req.user);
    const { question } = req;
    if (!question) {
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
      let findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: question,
      });
      if (findQuestion) {
        const questionBy = findQuestion.createdBy;

        let newRequestObj = {
          requestBy: user.id,
          requestTo: questionBy,
          roomId: req.roomId,
        };
        let newRequest =
          await global.models.GLOBAL.REQUEST_PROFILE_ACCESS.create(
            newRequestObj
          );
        let ntfObj = {
          userId: user.id,
          // typeof: "seeAnswer",
          receiverId: questionBy,
          title: `Notification By ${user.id} to ${questionBy}`,
          description: {
            data: { title: "Leaderbridge" },
            notification: {
              title: "New Request profile Access!!!",
              body: `You have received a request to view your profile in ${findQuestion.question}`,
            },
          },
          createdBy: user.id,
          updatedBy: user.id,
          question: question,
          createdAt: Date.now(),
        };
        let findToken = await global.models.GLOBAL.USER.findOne({
          _id: questionBy,
        });
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
        let notification = await global.models.GLOBAL.NOTIFICATION.create(
          ntfObj
        );

        const data4createResponseObject = {
          req: req,

          result: 0,
          message: messages.ITEM_INSERTED,
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
