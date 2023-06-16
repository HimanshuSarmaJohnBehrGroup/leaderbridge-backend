const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Get All Folder by Search
module.exports = exports = {
  handler: async (req, res) => {
    // try {
    let FindRegexp = await global.models.GLOBAL.USER.find({
      $and: [{ email: { $regex: "yopmail" } }],
    }).select({ email: 1, _id: 1 });

    const UserData = new Promise((resolve, reject) => {
      const Data = FindRegexp?.map(async ({ email, _id }) => {
        // const RemoveANSWER = await global.models.GLOBAL.ANSWER.deleteMany({
        //   $and: [{ createdBy: _id }],
        // });
        // const RmoveGroup = await global.models.GLOBAL.ANSWER_GROUP.deleteMany({
        //   $and: [{ createdBy: _id }],
        // });
        // const RemoveRoom = await global.models.GLOBAL.ANSWER_ROOM.deleteMany({
        //   $and: [{ createdBy: _id }],
        // });
        // const RemoveChat = await global.models.GLOBAL.CHAT.deleteMany({
        //   $and: [{ sender: _id }],
        // });
        // const RemoveChatRoom = await global.models.GLOBAL.CHAT_ROOM.deleteMany({
        //   $and: [{ createdBy: _id }],
        // });
        // const RemoveQuestion = await global.models.GLOBAL.QUESTION.deleteMany({
        //   $and: [{ createdBy: _id }],
        // });
        // const RemoveUser = await global.models.GLOBAL.USER.deleteMany({
        //   $and: [{ _id: _id }],
        // });
      });

      Promise.all(Data).then((data) => {
        resolve(data);
        console.log("dataSSSSSSSSSSSSSS", data);
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_INSERTED,
          payload: { question: FindRegexp },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      });
    });

    const data4createResponseObject = {
      req: req,
      result: 0,
      message: "Folder List",
      payload: FindRegexp,
      logPayload: false,
    };
    res
      .status(enums.HTTP_CODES.OK)
      .json(utils.createResponseObject(data4createResponseObject));
    //     } catch (error) {
    //       logger.error("Error in get folder list", error);
    //       const data4createResponseObject = {
    //         req: req,
    //         result: -1,
    //         message: "Error in get folder list",
    //         payload: {},
    //         logPayload: false,
    //       };
    //       res
    //         .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
    //         .json(utils.createResponseObject(data4createResponseObject));
    //     }
    //   },
  },
};
