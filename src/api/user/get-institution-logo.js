const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");
const { ObjectId } = require("mongodb");

// Get User by ID
module.exports = exports = {
  handler: async (req, res) => {
    let { user } = req;

    if (user.userType === enums.USER_TYPE.USER) {
      if (!user.isOrganization && !user.isCompanyVerify && user.isCompanyId) {
        const FindCompany = await global.models.GLOBAL.USER.findOne({
          isCompanyId: user.isCompanyId,
          isCompanyVerify: true,
        });
        if (!FindCompany) {
          const data4createResponseObject = {
            req: req,
            result: 1,
            message: messages.SUCCESS,
            payload: { organizationLogo: null },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }

        const FindLogo = await global.models.GLOBAL.USER.findOne({
          OrgRanDomID: FindCompany.OrgRanDomID,
          isOrganization: true,
        });

        if (FindLogo) {
          const data4createResponseObject = {
            req: req,
            result: 1,
            message: messages.SUCCESS,
            payload: { organizationLogo: FindLogo.organizationLogo },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }

        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.USER_NOT_VERIFY,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.BAD_REQUEST)
          .json(utils.createResponseObject(data4createResponseObject));
      } else if (
        !user.isOrganization &&
        user.isCompanyVerify &&
        user.isCompanyId &&
        user.OrgRanDomID
      ) {
        const FindCompany = await global.models.GLOBAL.USER.findOne({
          OrgRanDomID: user.OrgRanDomID,
          isOrganization: true,
        });

        if (FindCompany) {
          const data4createResponseObject = {
            req: req,
            result: 1,
            message: messages.SUCCESS,
            payload: { organizationLogo: FindCompany.organizationLogo },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.SUCCESS,
            payload: { organizationLogo: null },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.SUCCESS,
          payload: { organizationLogo: null },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    }

    // console.log("reqetuyetuyetuyetuy--->>", req);

    try {
    } catch (error) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.GENERAL,
        payload: error.message,
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
