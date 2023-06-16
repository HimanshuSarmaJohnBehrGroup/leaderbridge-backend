const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const { ObjectID } = require("mongodb");
const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");

// Retrieve and return all Question from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    // console.log("criteria", criteria);
    // console.log("AAAAAAAAASSSDDDDDDDDDDDD", req);
    const { id } = req.query;
    let criteria;
    if (id) {
      criteria = {
        _id: id,
      };
    }

    try {
      // let findUser = {
      //   name: "vijay",
      // };

      let findUser = await global.models.GLOBAL.USER.findOne(criteria);

      let verification_data = {
        language: "en-US",
        fields: [
          {
            field_id: "first_name",
            field_name: "First name",
            field_type: "text",
            field_value: findUser.name,
          },
          {
            field_id: "last_name",
            field_name: "Last name",
            field_type: "text",
            field_value: findUser.name,
          },
          {
            field_id: "id_number",
            field_name: "ID number",
            field_type: "text",
            field_value: findUser._id,
          },

          {
            field_id: "phone_number",
            field_name: "phone number",
            field_type: "phone_number",
            field_value: "+918877445511",
          },
        ],
        time: {
          immediately: true,
        },
      };
      // let newArray = [];
      // newArray.push({ findUser: userArray[0]?.user });
      return res.status(200).send(verification_data);
      // const data4createResponseObject = {
      //   verification_data,
      // };
      // res
      //   .status(enums.HTTP_CODES.OK)
      //   .json(utils.createResponseObject(verification_data));
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
