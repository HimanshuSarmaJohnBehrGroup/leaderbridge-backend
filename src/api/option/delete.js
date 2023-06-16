const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
    
    handler: async (req, res) => {
        const { user } = req;
        if( user.type != enums.USER_TYPE.ADMIN ) {
        const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.NOT_AUTHORIZED,
            payload: {},
            logPayload: false
        };
        return res.status(enums.HTTP_CODES.UNAUTHORIZED).json(utils.createResponseObject(data4createResponseObject));
    }
        const { id } = req.params;
        
        try {
        if(!id){
            let data4createResponseObject = {
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
            const deletedItem = await global.models.GLOBAL.OPTION.findByIdAndRemove({_id:id});
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
