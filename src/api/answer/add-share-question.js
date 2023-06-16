const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const { ObjectId } = require("mongodb");
const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  //Router Handler
  handler: async (req, res) => {
    const { user } = req;
    // const { questionId } = req.params;
    // const { userId, reach } = req.body;
    const {
      question,
      dropdown,
      experience,
      displayProfile,
      allowConnectionRequest,
      filter,
      questionId,
      userIdArray,
      group,
    } = req.body;

    // if (!questionId) {
    //   const data4createResponseObject = {
    //     req: req,
    //     result: -1,
    //     message: messages.INVALID_PARAMETERS,
    //     payload: {},
    //     logPayload: false,
    //   };
    //   return res
    //     .status(enums.HTTP_CODES.BAD_REQUEST)
    //     .json(utils.createResponseObject(data4createResponseObject));
    // }

    if (!questionId) {
      let questionCreate = {
        question: question,
        displayProfile: displayProfile,
        allowConnectionRequest: allowConnectionRequest,
        filter: filter,
        dropdown: dropdown,
        experience: experience,
        group: group,
        createdAt: Date.now(),
        createdBy: user._id,
        reach: userIdArray.length,
        share: true,
      };
      const newQuestion = await global.models.GLOBAL.QUESTION.create(
        questionCreate
      );

      if (newQuestion) {
        const userIdArrayData = new Promise((resolve, reject) => {
          const Data = userIdArray?.map(async (userId) => {
            const updatedAnswerLaterData =
              await global.models.GLOBAL.USER.findOneAndUpdate(
                { _id: ObjectId(userId) },
                {
                  $addToSet: {
                    shareQuestion: newQuestion?._id,
                  },
                },
                { new: true }
              );

            // await global.models.GLOBAL.QUESTION.findOneAndUpdate(
            //   { _id: ObjectId(newQuestion?._id) },
            //   { $inc: { reach: userIdArray.length } },

            //   { new: true }
            // );
          });

          Promise.all(Data).then((data) => {
            resolve(data);
            const data4createResponseObject = {
              req: req,
              result: 0,
              message: messages.ITEM_INSERTED,
              payload: { question: newQuestion },
              logPayload: false,
            };
            res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          });
        });
      }
    } else {
      const FindQuestion = await global.models.GLOBAL.QUESTION.findOne({
        _id: ObjectId(questionId),
      });

      console.log("FindQuestion", FindQuestion);

      if (FindQuestion && FindQuestion?.share == false) {
        let UpdateQuestion =
          await global.models.GLOBAL.QUESTION.findByIdAndUpdate(
            { _id: FindQuestion?._id },
            {
              $set: {
                question: question,
                displayProfile: displayProfile,
                allowConnectionRequest: allowConnectionRequest,
                filter: filter,
                dropdown: dropdown,
                experience: experience,
                updatedAt: Date.now(),
                share: true,
                updatedBy: user._id,
                reach: userIdArray?.length,
              },
            },
            { new: true }
          );
      } else {
        let UpdateQuestion =
          await global.models.GLOBAL.QUESTION.findByIdAndUpdate(
            { _id: FindQuestion?._id },
            {
              $set: {
                question: question,
                displayProfile: displayProfile,
                allowConnectionRequest: allowConnectionRequest,
                filter: filter,
                dropdown: dropdown,
                experience: experience,
                updatedAt: Date.now(),
                share: true,
                updatedBy: user._id,
                reach: FindQuestion?.reach + userIdArray?.length,
              },
              // $inc: { reach: 1 },
            },
            { new: true }
          );
      }

      if (FindQuestion) {
        const userIdArrayData = new Promise((resolve, reject) => {
          const Data = userIdArray?.map(async (userId) => {
            const updatedAnswerLaterData =
              await global.models.GLOBAL.USER.findOneAndUpdate(
                { _id: ObjectId(userId) },
                {
                  $addToSet: {
                    shareQuestion: ObjectId(FindQuestion?._id),
                  },
                },
                { new: true }
              );
          });

          Promise.all(Data).then((data) => {
            resolve(data);
            console.log("dataSSSSSSSSSSSSSS", data);
            const data4createResponseObject = {
              req: req,
              result: 0,
              message: messages.ITEM_INSERTED,
              payload: { question: FindQuestion },
              logPayload: false,
            };
            res
              .status(enums.HTTP_CODES.OK)
              .json(utils.createResponseObject(data4createResponseObject));
          });
        });
      } else {
        const data4createResponseObject = {
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
    }
  },
};
