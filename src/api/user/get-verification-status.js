const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");
const { ObjectID } = require("mongodb");
// Retrieve and return all Question from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    // console.log("criteria", criteria);

    const { id } = req.query;

    if (!id) {
      try {
        let Verification = await global.models.GLOBAL.FULLYVERIFYSATUS.find({})
          .populate({
            path: "customer_case_id",
            model: "user",
            select:
              "_id name subject profileImage currentRole email blockUser isOnline",
          })
          .sort({
            createdAt: -1,
          });

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.SUCCESS,
          payload: Verification,
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
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
      try {
        let Verification = await global.models.GLOBAL.FULLYVERIFYSATUS.findOne({
          customer_case_id: id,
          status: "collecting_data_finished",
        })
          .populate({
            path: "customer_case_id",
            model: "user",
            select:
              "_id name subject profileImage currentRole email blockUser isOnline",
          })
          .sort({
            createdAt: -1,
          });

        console.log("AAAAAAAAAS", Verification);

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.SUCCESS,
          payload: {
            status: Verification ? "completed" : "fail",
            Verification: Verification,
          },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
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
  },
};
