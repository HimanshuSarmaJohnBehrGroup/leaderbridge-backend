const Joi = require("joi");
const { ObjectId } = require("mongodb");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
module.exports = exports = {
  handler: async (req, res, next) => {
    const FindFilter = await global.models.GLOBAL.GRAPH.find({});
    // if (!FindFilter) {
    //   const data4createResponseObject = {
    //     req: req,
    //     result: -1,
    //     message: "filter not found",
    //     payload: {},
    //     logPayload: false,
    //   };
    //   return res
    //     .status(enums.HTTP_CODES.BAD_REQUEST)
    //     .json(utils.createResponseObject(data4createResponseObject));
    // }

    if (FindFilter) {
      const data4createResponseObject = {
        req: req,
        result: 1,
        message: "graph found",
        payload: FindFilter,
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
