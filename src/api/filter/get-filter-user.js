const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const { ObjectId } = require("mongodb");

// Retrieve and return all Category from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { type, id, admin } = req.query;
    // console.log("typetypetypetypetype", type);
    let criteria = {};
    let filter;
    if (!admin) {
      if (type) {
        let filterType = await global.models.GLOBAL.FILTER_TYPE.findOne(
          { name: type },
          { _id: 1 }
        );
        if (filterType) {
          criteria["filterTypeId"] = filterType._id;
          criteria["status"] = true;
          // criteria["filterTypeId"] = filterType._id;
        }
      } else {
        criteria["filterTypeId"] = ObjectId("6188f2c9603a571b33b0957d");
        criteria["status"] = true;
        criteria["profileHide"] = false;
      }
      if (id) {
        criteria["_id"] = ObjectId(id);
      }
    } else {
      if (type) {
        let filterType = await global.models.GLOBAL.FILTER_TYPE.findOne(
          { name: type },
          { _id: 1 }
        );
        if (filterType) {
          criteria["filterTypeId"] = filterType._id;
          criteria["status"] = true;
          // criteria["status"] = true;
          // criteria["filterTypeId"] = filterType._id;
        }
      } else {
        criteria["filterTypeId"] = "6188f2c9603a571b33b0957d";
        criteria["status"] = true;
      }
      if (id) {
        criteria["_id"] = id;
      }
    }

    try {
      // let filter = await global.models.GLOBAL.FILTER.find(criteria).sort({
      //   createdAt: -1,
      // });

      console.log("CRITERIA", criteria);

      if (!admin) {
        filter = await global.models.GLOBAL.FILTER.aggregate([
          {
            $match: criteria,
          },

          {
            $unwind: {
              path: "$options",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              "options.status": true,
              status: true,
            },
          },
          {
            $group: {
              _id: "$_id",
              options: {
                $push: "$options",
              },
              filterTypeId: {
                $first: "$filterTypeId",
              },
              name: {
                $first: "$name",
              },
              multiSelect: {
                $first: "$multiSelect",
              },

              orders: {
                $first: "$orders",
              },

              status: {
                $first: "$status",
              },
            },
          },

          { $sort: { orders: 1 } },
          // { $sort: { name: -1 } },
        ]);
      } else {
        filter = await global.models.GLOBAL.FILTER.find(criteria).sort({
          orders: 1,
        });
      }

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: { filter: filter },
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
  },
};
