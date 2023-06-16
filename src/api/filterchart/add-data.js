const Joi = require("joi");
const { ObjectId } = require("mongodb");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  // route validation
  validation: Joi.object({
    name: Joi.string().required(),

    // options: Joi.array().required(),
  }),

  handler: async (req, res) => {
    const { filterTypeId, name, options } = req.body;
    if (!name) {
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

    const FindFilter = await global.models.GLOBAL.GRAPH.findOne({
      name: name,
    });

    if (FindFilter) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: "filter name already exist",
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    try {
      let filterCreate = {
        name: name,
      };

      const filter = await global.models.GLOBAL.GRAPH.create(filterCreate);
      const data4createResponseObject = {
        req: req,
        result: 1,
        message: messages.SUCCESS,
        payload: filter,
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    } catch (error) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.SERVER_ERROR,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
