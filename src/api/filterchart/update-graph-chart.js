const Joi = require("joi");
const { ObjectId } = require("mongodb");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const jwt = require("jsonwebtoken");
const jwtOptions = require("../../auth/jwt-options");
module.exports = exports = {
  handler: async (req, res, next) => {
    const { user } = req;
    const { find } = req.query;
    const options = JSON.parse(req.body.options);
    const { graphId, name, orders, status, type, userId, color } = req.body;
    let profileImage = req?.file?.location;
    const FindGraph = await global.models.GLOBAL.USER_GRAPH.findOne({
      graphId: ObjectId(graphId),
      userId: ObjectId(userId),
    });

    let UserFilter;

    console.log("findfindfindfind", find == "false");

    if (FindGraph) {
      UserFilter = await global.models.GLOBAL.USER_GRAPH.findOneAndUpdate(
        {
          graphId: ObjectId(graphId),
          userId: ObjectId(userId),
        },
        {
          graphId,
          color,
          name,
          options,
          orders,
          status,
          type,
          userId,
          image: profileImage,
          updatedAt: Date.now(),
        },
        {
          new: true,
          upsert: true,
        }
      );
    } else {
      UserFilter = await global.models.GLOBAL.USER_GRAPH.create({
        graphId,
        name,
        options,
        orders,
        status,
        type,
        color,
        userId,
        image: profileImage,
      });
    }

    const findUser = await global.models.GLOBAL.USER.findOne({
      _id: ObjectId(userId),
    });

    const data4token = {
      id: findUser._id,
      date: Date.now(),
      environment: process.env.APP_ENVIRONMENT,
      email: findUser.email.toLowerCase(),
      userType: findUser.userType,
      subject: findUser.subject,
      abuseQuestion: findUser.abuseQuestion,
      abuseAnswer: findUser.abuseAnswer,
      OrgRanDomID: findUser?.OrgRanDomID,
      scope: "login",
      currentRole: findUser?.currentRole,
    };

    if (type == "subject") {
      const UserProfileImage = await global.models.GLOBAL.USER.findOneAndUpdate(
        {
          _id: ObjectId(userId),
        },
        {
          profileImage: profileImage,
        }
      );
    }

    if (find === "false") {
      console.log("XXXXXXXXXXXXXXXXXXXXX", findUser._id);
      const FindGraph = await global.models.GLOBAL.USER_GRAPH.find({
        userId: findUser._id,
      });

      const DataFuntion = FindGraph?.map((item) => {
        return item.graphId;
      });

      const UserFilter = await global.models.GLOBAL.GRAPH.aggregate([
        {
          $match: { _id: { $nin: DataFuntion } },
        },
        {
          $addFields: {
            graphId: "$_id",
            userId: findUser._id, // Replace "your_user_id" with the actual user ID
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

      Promise.all(
        UserFilter?.map(async (item) => {
          const FindGraph = await global.models.GLOBAL.USER_GRAPH.findOne({
            graphId: ObjectId(item.graphId),
            userId: ObjectId(findUser._id),
          });

          if (!FindGraph) {
            await global.models.GLOBAL.USER_GRAPH.create({
              graphId: item.graphId,
              name: item.name,
              options: item.options,
              orders: item.orders,
              status: item.status,
              type: item.type,
              color: item.color,
              userId: findUser._id,
              // image: item.image,
            });
          }
        })
      ).then((result) => {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: "Update graph successfully",
          payload: {
            UserFilter,
            findUser,
            token: jwt.sign(data4token, jwtOptions.secretOrKey),
          },
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      });
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
    if (find == "true") {
      if (UserFilter) {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: "Update graph successfully",
          payload: {
            UserFilter,
            findUser,
            token: jwt.sign(data4token, jwtOptions.secretOrKey),
          },
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      }
    }
  },
};
