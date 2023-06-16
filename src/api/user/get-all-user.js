const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");

// Retrieve and return all Question from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { userId } = req.query;
    let criteria = {};
    if (userId) {
      criteria = {
        _id: userId,
      };
    }

    // console.log("criteria", criteria);
    try {
      let userArray = [];
      let findUser = await global.models.GLOBAL.USER.find(criteria).sort({
        createdAt: -1,
      });
      if (findUser) {
        let findConection = await global.models.GLOBAL.CONNECTION.find({
          senderId: user._id,
        });
        // // console.log("Find Connection --->", findConection);
        let pandingConnection = await global.models.GLOBAL.CONNECTION.find({
          receiverId: user._id,
        });

        const conectIdExist = (id) => {
          return user.accepted.length
            ? user.accepted.some(function (el) {
                return el.toString() == id.toString();
              })
            : false;
        };

        const sentIdExist = (id) => {
          var check = findConection.filter(function (elc) {
            return elc.receiverId.toString() == id.toString();
          });
          return check.length;
        };

        const pandingIdExist = (id) => {
          let panding = pandingConnection.filter(function (elf) {
            return elf.senderId.toString() === id.toString();
          });
          return panding.length;
        };

        for (let i = 0; i < findUser.length; i++) {
          if (conectIdExist(findUser[i]?._id)) {
            const userObj = {
              user: findUser[i],
              isFriend: "true",
            };
            userArray.push(userObj);
          } else if (sentIdExist(findUser[i]?._id)) {
            let findConnection = await global.models.GLOBAL.CONNECTION.findOne({
              senderId: user._id,
              receiverId: findUser[i]?._id,
            });
            const userObj = {
              user: findUser[i],
              isFriend: "sent",
              connection: findConnection,
            };
            userArray.push(userObj);
          } else if (pandingIdExist(findUser[i]?._id)) {
            let findConnection = await global.models.GLOBAL.CONNECTION.findOne({
              senderId: findUser[i]?._id,
              receiverId: user._id,
            });
            const userObj = {
              user: findUser[i],
              isFriend: "pending",
              connection: findConnection,
            };
            userArray.push(userObj);
          } else {
            const userObj = {
              user: findUser[i],
              isFriend: "false",
            };
            userArray.push(userObj);
          }
        }
      }

      // let newArray = [];
      // newArray.push({ findUser: userArray[0]?.user });
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: { userArray },
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
