const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");
const { ObjectID } = require("mongodb");
const jwtOptions = require("../../auth/jwt-options");
const jwt = require("jsonwebtoken");
// Retrieve and return all Question from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { DocumentType, Country } = req.body;

    const { userId } = req.params;

    console.log("WWWWWWWWWWWWWWWWWW", userId);

    let user_image = req.files["user_image"][0].location;
    let document_image_front = req.files["document_image_front"][0].location;
    let document_image_back = req.files["document_image_back"][0].location;

    // console.log("ImagesImages", profileImage);
    try {
      // let findUser = {
      //   name: "vijay",
      // };

      let fillForm = await global.models.GLOBAL.USER.findOne({
        _id: userId,
      }).lean();

      if (!fillForm) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.USER_DOES_NOT_EXIST,
          payload: {},
          logPayload: false,
          status: enums.HTTP_CODES.OK,
        };
        return res
          .status(400)
          .json(utils.createResponseObject(data4createResponseObject));
      }

      console.log("AAAAAAAAAAAASSSS", userId);

      const verificationStatus = {
        DocumentType: DocumentType,
        Country: Country,
        user_image: user_image,
        document_image_front: document_image_front,
        document_image_back: document_image_back,
        userId: ObjectID(userId),
        createdAt: Date.now(),
      };

      const findUser = await global.models.GLOBAL.FULLYVERIFYSATUS.findOne({
        userId: ObjectID(userId),
      }).lean();

      console.log("AAAAAAAAAAAASSSS", findUser);
      // let newArray = [];
      // newArray.push({ findUser: userArray[0]?.user });

      if (findUser) {
        const updatedBlockUserList =
          await global.models.GLOBAL.FULLYVERIFYSATUS.findOneAndUpdate(
            { userId: ObjectID(userId) },
            {
              $set: {
                DocumentType: DocumentType,
                Country: Country,
                user_image: user_image,
                document_image_front: document_image_front,
                document_image_back: document_image_back,
                userId: ObjectID(userId),
                createdAt: Date.now(),
              },
            },
            { new: true }
          );

        await global.models.GLOBAL.USER.findOneAndUpdate(
          { _id: ObjectID(userId) },
          {
            $set: {
              fullyVerified: true,
            },
          },
          { new: true }
        );
      } else {
        let Verification = await global.models.GLOBAL.FULLYVERIFYSATUS.create(
          verificationStatus
        );

        await global.models.GLOBAL.USER.findOneAndUpdate(
          { _id: ObjectID(userId) },
          {
            $set: {
              fullyVerified: true,
            },
          },
          { new: true }
        );
      }

      if (verificationStatus.status == "collecting_data_finished") {
        const updatedBlockUserList =
          await global.models.GLOBAL.USER.findOneAndUpdate(
            { _id: ObjectID(customer_case_id) },
            {
              $set: {
                fullyVerified: true,
              },
            },
            { new: true }
          );
      }

      const data4token = {
        id: fillForm._id,
        date: Date.now(),
        environment: process.env.APP_ENVIRONMENT,
        email: fillForm.email,
        userType: fillForm.userType,
        subject: fillForm.subject,
        abuseQuestion: fillForm.abuseQuestion,
        currentRole: fillForm.currentRole,
        abuseAnswer: fillForm.abuseAnswer,
        scope: "signup",
      };

      delete fillForm.password;

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: {
          verificationStatus: verificationStatus,
          fillForm: fillForm,
          token: jwt.sign(data4token, jwtOptions.secretOrKey),
        },
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
