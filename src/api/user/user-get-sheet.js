const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");
const { ObjectId } = require("mongodb");
const userData = require("./user-data");

// Retrieve and return all Question from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const FindUser = await global.models.GLOBAL.USER.find().select({
      _id: 1,
      countryOfResidence: 1,
      // countryOfResidenceShow: 1,
      // levelOfEducation: 1,
      // levelOfEducationShow: 1,
      // industry: 1,
      // industryShow: 1,
      // targetMarket: 1,
      // targetMarketShow: 1,
      // numberOfcompany: 1,
      // numberOfcompanyShow: 1,
      // fundingRoundStatus: 1,
      // fundingRoundStatusShow: 1,
      // StartupOrganization: 1,
      // StartupOrganizationShow: 1,
      // yourCompanyFounded: 1,
      // yourCompanyFoundedShow: 1,
      // TypeofStartup: 1,
      // TypeofStartupShow: 1,
      // currentRole: 1,
      // subject: 1,
    });
    const FindUserSSSSS = await global.models.GLOBAL.USER.find().count();

    console.log("FindUserSSSSS", FindUserSSSSS);

    // countryOfResidence :Single Select
    // levelOfEducation :Single Select
    // industry :Single Select
    // currentRole :Single Select
    // targetMarket :Array Select
    // numberOfcompany :Array Select
    // fundingRoundStatus :Array Select
    // StartupOrganization :Array Select
    // yourCompanyFounded :Array Select
    // TypeofStartup :Array Select
    // subject :Array Select

    const Update = async (user) => {
      console.log("useruseruseruser", user?.subject);
      const GetFilterstion = await global.models.GLOBAL.FILTER.findOne({
        filterTypeId: ObjectId("6188f2c9603a571b33b0957d"),
        status: true,
        $and: [
          // array
          // {
          //   "options.optionName": {
          //     $in: user?.subject,
          //   },
          // },
          // single select
          {
            "options.optionName": {
              $eq: user?.countryOfResidence,
            },
          },
        ],
      });

      console.log("GetFilterstionGetFilterstion", GetFilterstion);
      // Single Select
      const updatedOptions = GetFilterstion?.options.filter(
        (option) => option.optionName == user?.countryOfResidence
      );

      // console.log("updatedOptionsupdatedOptions", updatedOptions);

      // Array
      // const updatedOptions = GetFilterstion?.options.filter((option) =>
      //   user?.subject?.includes(option.optionName)
      // );

      const ChangeFilterData = {
        name: GetFilterstion?.name,
        filterTypeId: GetFilterstion?.filterTypeId,
        status: GetFilterstion?.status,
        userId: ObjectId(user._id),
        options: updatedOptions,
        filterId: GetFilterstion?._id,
        displayProfile: true,
        // ? user?.countryOfResidenceShow : true,
      };

      const FindUserFilter = await global.models.GLOBAL.USER_FILTER.findOne({
        userId: ObjectId(user._id),
        filterId: ObjectId(GetFilterstion?._id),
      });

      if (GetFilterstion?._id) {
        if (FindUserFilter) {
          const updateFilter =
            await global.models.GLOBAL.USER_FILTER.findOneAndUpdate(
              { userId: ObjectId(user._id) },
              { filterId: ObjectId(GetFilterstion?._id) },
              { $set: { options: updatedOptions } }
            );

          return updateFilter;
        } else {
          console.log("ChangeFilterData", ChangeFilterData);
          const createFilter = await global.models.GLOBAL.USER_FILTER.create(
            ChangeFilterData
          );

          return createFilter;
        }
      }
    };

    const MapUser = await Promise.all(
      await FindUser.map(async (user) => {
        console.log("WWWWWWWWWWWWWWWWWW", user.countryOfResidence);

        {
          user?.countryOfResidence && (await Update(user));
        }
      })
    ).then((data) => {
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: { data: data.length, FindUser },
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    });
  },
};
