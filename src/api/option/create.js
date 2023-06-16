/**
 * Created by Bhargav Butani on 16.07.2021
 */
 const _ = require("lodash");
 const Joi = require("joi");
 const ObjectId = require("mongodb").ObjectId;
 const enums = require("../../../json/enums.json");
 const messages = require("../../../json/messages.json");
 const jwt = require("jsonwebtoken");
 const logger = require("../../logger");
 const utils = require("../../utils");
 const jwtOptions = require("../../auth/jwt-options");


 module.exports = exports = {
     // router validation
     validation: Joi.object({name: Joi.string().required(),
}),
 
     // route handler
     handler: async (req, res) => {
         const { user } = req;
    //      if( user.type != enums.USER_TYPE.ADMIN ) {
    //     const data4createResponseObject = {
    //         req: req,
    //         result: -1,
    //         message: messages.NOT_AUTHORIZED,
    //         payload: {},
    //         logPayload: false
    //     };
    //     return res.status(enums.HTTP_CODES.UNAUTHORIZED).json(utils.createResponseObject(data4createResponseObject));
    // }
         let {name } = req.body;
                 
                
         const body = {name: name, };

         const data = global.models.GLOBAL.OPTION(body);
         
         try {
             await data.save();
         } catch (error) {
             logger.error("/admin - Error encountered while trying to add new admin:\n" + error);
             const data4createResponseObject = {
                 req: req,
                 result: -1,
                 message: messages.GENERAL,
                 payload: {},
                 logPayload: false
             };
             res.status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(utils.createResponseObject(data4createResponseObject));
             return;
         }

         const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.SUCCESS,
            payload: { option : data },
            logPayload: false
        };
        res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
     }
 
 };
 