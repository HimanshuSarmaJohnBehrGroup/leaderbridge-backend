const Joi = require("joi");
const { ObjectId } = require("mongodb");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
module.exports = exports = {
  handler: async (req, res, next) => {
    const { user } = req;
    const { profile } = req.query;
    const { userId } = req.query;
    let ID = userId ? userId : user?._id;

    console.log("profileprofileprofile", userId);

    if (profile == "true") {
      console.log("CCCCCCCCCCCCCCCCCCC");
      const FindGraph = await global.models.GLOBAL.USER_GRAPH.find({
        userId: ID,
      });

      const DataFuntion = FindGraph?.map((item) => {
        return item.graphId;
      });

      console.log("FFFFFFFFFFFFFAAAAAAAAAAAAAAAAAA", DataFuntion);

      const UserFilter = await global.models.GLOBAL.GRAPH.aggregate([
        {
          $match: { _id: { $nin: DataFuntion } },
        },
        {
          $addFields: {
            graphId: "$_id",
            userId: ID, // Replace "your_user_id" with the actual user ID
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
        {
          $unset: "__v",
        },
      ]);

      const Findalue = [...FindGraph, ...UserFilter];

      const data4createResponseObject = {
        req: req,
        result: 1,
        message: "graph found",
        payload: Findalue,
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    } else {
      const FindGraph = await global.models.GLOBAL.USER_GRAPH.find({
        userId: ID,
        type: "subject",
      });

      const UserFilter = await global.models.GLOBAL.GRAPH.aggregate([
        // {
        //   $match: { type: "subject" },
        // },
        {
          $addFields: {
            graphId: "$_id",
            userId: ID, // Replace "your_user_id" with the actual user ID
          },
        },
        // {
        //   $project: {
        //     _id: 0,
        //   },
        // },

        {
          $unset: "__v",
        },
      ]);

      if (UserFilter) {
        const data4createResponseObject = {
          req: req,
          result: 1,
          message: "graph found",
          payload: UserFilter,
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    }

    // const FindFilter = await global.models.USER_GRAPH.find({});
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
  },
};
