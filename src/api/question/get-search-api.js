const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Get All Folder by Search
module.exports = exports = {
  handler: async (req, res) => {
    const { search } = req.query;

    try {
      let folder = await global.models.GLOBAL.QUESTION.find({
        question: { $regex: search, $options: "i" },
      });
      let data4createResponseObject = {
        req: req,
        result: 0,
        message: "Folder List",
        payload: folder,
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    } catch (error) {
      logger.error("Error in get folder list", error);
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: "Error in get folder list",
        payload: {},
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
