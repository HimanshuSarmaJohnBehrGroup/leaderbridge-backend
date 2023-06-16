const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Delete category with the specified catId in the request

module.exports = exports = {
    // route validation

    // route handler
    handler: async (req, res) => {
        const { filterTypeId } = req.query;
        if (!filterTypeId) {
            const data4createResponseObject = {
                req: req,
                result: -1,
                message: messages.INVALID_PARAMETERS,
                payload: {},
                logPayload: false
            };
            return res.status(enums.HTTP_CODES.BAD_REQUEST).json(utils.createResponseObject(data4createResponseObject));
        }
        let filterItemsExist = await global.models.GLOBAL.FILTER.find({ filterTypeId: filterTypeId });
        if(filterItemsExist.length > 0) {
            const data4createResponseObject = {
                req: req,
                result: -1,
                message: "Filter type has dependant filter items.",
                payload: {},
                logPayload: false
            };
            return res.status(enums.HTTP_CODES.BAD_REQUEST).json(utils.createResponseObject(data4createResponseObject));
        }
        try {
            const deletedItem = await global.models.GLOBAL.FILTER_TYPE.findByIdAndRemove(filterTypeId);
            if(!deletedItem) {
                const data4createResponseObject = {
                    req: req,
                    result: 0,
                    message: messages.ITEM_NOT_FOUND,
                    payload: {},
                    logPayload: false
                };
                res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
            } else {
                const data4createResponseObject = {
                    req: req,
                    result: 0,
                    message: messages.ITEM_DELETED,
                    payload: {},
                    logPayload: false
                };
                res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
            }
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


