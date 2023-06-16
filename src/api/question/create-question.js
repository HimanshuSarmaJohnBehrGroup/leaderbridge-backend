const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  // route validation
  validation: Joi.object({
    question: Joi.string().required(),
    dropdown: Joi.string().allow(""),
    experience: Joi.string().allow(""),
    displayProfile: Joi.boolean().allow(),
    allowConnectionRequest: Joi.boolean().allow(),
    filter: Joi.array().allow(),
    group: Joi.string().allow(""),
    reach: Joi.number(),
  }),

  handler: async (req, res) => {
    const { user } = req;
    const {
      question,
      displayProfile,
      allowConnectionRequest,
      filter,
      dropdown,
      experience,
      group,
      reach,
    } = req.body;
    if (!question) {
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

    try {
      const findQuestion = await global.models.GLOBAL.QUESTION.findOne({
        question: question,
        createdBy: user._id,
      });

      if (!findQuestion) {
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
          reach: reach,
        };
        const newQuestion = await global.models.GLOBAL.QUESTION.create(
          questionCreate
        );

        const CreateGroup = new Promise(async (resolve, reject) => {
          if (newQuestion?.group == "Everyone") {
            let GroupparticipateIds = [];
            GroupparticipateIds.push({
              _id: user._id,
              createdAt: new Date(),
            });

            let RoomID = {
              participateIds: GroupparticipateIds,
              questionId: newQuestion._id,
              createdAt: new Date(),
              createdBy: user._id,
            };

            await global.models.GLOBAL.ANSWER_GROUP.create(
              RoomID,
              (err, result) => {
                if (err) {
                  reject(err);
                } else {
                  console.log("BBBBBBBBBBBBBBBB", result);
                  resolve(result);
                }
              }
            );
          }
        });

        // let GroupparticipateIds = [];
        // GroupparticipateIds.push({
        //   _id: user._id,
        //   createdAt: new Date(),
        // });

        // let RoomID = {
        //   participateIds: GroupparticipateIds,
        //   questionId: newQuestion._id,
        //   createdAt: new Date(),
        //   createdBy: user._id,
        // };

        // const CreateGroup = await global.models.GLOBAL.ANSWER_GROUP.create(
        //   RoomID
        // );

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_INSERTED,
          payload: { newQuestion, CreateGroup },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const updateQuestion =
          await global.models.GLOBAL.QUESTION.findByIdAndUpdate(
            { _id: findQuestion._id },
            {
              $set: {
                share: false,
                updatedAt: Date.now(),
                updatedBy: user._id,
                reach: reach,
              },
            },
            { new: true }
          );
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_INSERTED,
          payload: { newQuestion: findQuestion },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      }
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
