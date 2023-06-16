const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
    // route validation
    validation: Joi.object({
        name: Joi.string(),
        intent: Joi.string(),
    }),

    handler: async (req, res) => {
        const { filterTypeId } = req.query;
        const { name, intent } = req.body;
        const filterTypeExists = await global.models.GLOBAL.FILTER_TYPE.findById(filterTypeId);
        if(!filterTypeExists) {
            const data4createResponseObject = {
                req: req,
                result: -1,
                message: "filter type does not exists in system",
                payload: {},
                logPayload: false
            };
            return res.status(enums.HTTP_CODES.BAD_REQUEST).json(utils.createResponseObject(data4createResponseObject));
        }

        try {
            let updateData = {};
            if(name) {
                updateData.name = name;
            }
            if(intent) {
                updateData.intent = intent;
            }
            let set = { $set : updateData};
            const updatefilterType = await global.models.GLOBAL.FILTER_TYPE.findByIdAndUpdate(filterTypeId, set, { new: true });

            const data4createResponseObject = {
                req: req,
                result: 0,
                message: messages.ITEM_UPDATED,
                payload: { updatefilterType },
                logPayload: false
            };
            res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
        } catch (error) {
            logger.error(`${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`);
            const data4createResponseObject = {
                req: req,
                result: -1,
                message: messages.GENERAL,
                payload: {},
                logPayload: false
            };
            res.status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(utils.createResponseObject(data4createResponseObject));
        }
    }
};
