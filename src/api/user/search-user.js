const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Get All Folder by Search
module.exports = exports = {
  handler: async (req, res) => {
    const { user } = req;
    const { search } = req.query;
    const { filter } = req.body;
    // // console.log("BODY--->>", filter);
    try {
      let criteria = [];
      let searchUser = [];

      let renge = [];
      let distinctUser;

      if (filter && search) {
        for (let i = 0; i < filter.length; i++) {
          fil = filter[i];
          if (fil.filterId == "6188f31e603a571b33b09585") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              subject: { $in: optionName },
            });
          }
          if (fil.filterId == "6188f41c603a571b33b095d9") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              currentRole: { $in: optionName },
              currentRoleShow: { $eq: true },
            });
          }
          if (fil.filterId == "618909c5fec3b250c029caec") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              industry: { $in: optionName },
              industryShow: { $eq: true },
            });
          }
          if (fil.filterId == "6188f536603a571b33b09644") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              employeeNumber: { $in: optionName },
              employeeNumberShow: { $eq: true },
            });
          }
          if (fil.filterId == "61890a1dfec3b250c029cb05") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              region: { $in: optionName },
              regionShow: { $eq: true },
            });
          }
          if (fil.filterId == "6188f6d1a06a481f928d6667") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              countryOfOrigin: { $in: optionName },
              countryOfOriginShow: { $eq: true },
            });
          }
          if (fil.filterId == "6189098afec3b250c029cadd") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              countryOfResidence: { $in: optionName },
              countryOfResidenceShow: { $eq: true },
            });
          }
          if (fil.filterId == "6188f7caa06a481f928d6699") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              levelOfEducation: { $in: optionName },
              levelOfEducationShow: { $eq: true },
            });
          }
          if (fil.filterId == "618909a2fec3b250c029cae2") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              ethnicityShow: { $eq: true },
              ethnicity: { $in: optionName },
            });
          }
          if (fil.filterId == "61890a10fec3b250c029cb00") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              politicalAffiliation: { $in: optionName },
              politicalAffiliationShow: { $eq: true },
            });
          }
          if (fil.filterId == "61890a36fec3b250c029cb0a") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              religiousAffiliation: { $in: optionName },
              religiousAffiliationShow: { $eq: true },
            });
          }
          if (fil.filterId == "61890a4efec3b250c029cb0f") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              sexualOrientation: { $in: optionName },
              sexualOrientationShow: { $eq: true },
            });
          }
          if (fil.filterId == "619e0cf5641d2f00f887ece1") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              gender: { $in: optionName },
              gendereShow: { $eq: true },
            });
          }
          if (fil.filterId == "619e0cec641d2f00f887ecdc") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            let opts = optionName;
            for (let i = 0; i < opts.length; i++) {
              const value = opts[i].split("-");
              // // console.log("VAL - 1 = ", value[0]);
              // // console.log("VAL - 2 = ", value[1]);
              renge.push({
                age: { $gte: parseInt(value[0]), $lte: parseInt(value[1]) },
              });
            }
            let usersdata = await global.models.GLOBAL.USER.aggregate([
              {
                $match: {
                  $and: [
                    { _id: { $nin: user._id } },
                    { formFilled: { $eq: true } },
                    { userType: { $ne: "admin" } },
                  ],
                },
              },
              {
                $project: {
                  // password: 0,
                  date: {
                    $dateFromString: {
                      dateString: "$DOB",
                    },
                  },
                },
              },
              {
                $addFields: {
                  age: {
                    $round: [
                      {
                        $divide: [
                          { $subtract: [Date.now(), "$date"] },
                          365 * 24 * 60 * 60 * 1000,
                        ],
                      },
                      0,
                    ],
                  },
                },
              },
              {
                $match: {
                  $or: [...renge],
                },
              },
              {
                $project: {
                  _id: "$_id",
                  test: "test",
                },
              },
              {
                $group: {
                  _id: "$test",
                  array: { $push: "$_id" },
                },
              },
              {
                $project: {
                  array: 1,
                  _id: 0,
                },
              },
            ]);
            if (usersdata) {
              criteria.push({
                _id: { $in: usersdata[0].array },
                DOBShow: { $eq: true },
              });
            }
          }
        }

        distinctUser = await global.models.GLOBAL.USER.find(
          {
            $or: [
              { currentRole: { $regex: search, $options: "i" } },
              {
                $or: criteria,
              },
            ],
          },
          { password: 0 }
        );
      } else if (search) {
        distinctUser = await global.models.GLOBAL.USER.find(
          {
            currentRole: { $regex: search, $options: "i" },
          },
          { password: 0 }
        );
      } else if (filter) {
        for (let i = 0; i < filter.length; i++) {
          fil = filter[i];
          if (fil.filterId == "6188f31e603a571b33b09585") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              subject: { $in: optionName },
            });
          }
          if (fil.filterId == "6188f41c603a571b33b095d9") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              currentRole: { $in: optionName },
              currentRoleShow: { $eq: true },
            });
          }
          if (fil.filterId == "618909c5fec3b250c029caec") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              industry: { $in: optionName },
              industryShow: { $eq: true },
            });
          }
          if (fil.filterId == "6188f536603a571b33b09644") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              employeeNumber: { $in: optionName },
              employeeNumberShow: { $eq: true },
            });
          }
          if (fil.filterId == "61890a1dfec3b250c029cb05") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              region: { $in: optionName },
              regionShow: { $eq: true },
            });
          }
          if (fil.filterId == "6188f6d1a06a481f928d6667") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              countryOfOrigin: { $in: optionName },
              countryOfOriginShow: { $eq: true },
            });
          }
          if (fil.filterId == "6189098afec3b250c029cadd") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              countryOfResidence: { $in: optionName },
              countryOfResidenceShow: { $eq: true },
            });
          }
          if (fil.filterId == "6188f7caa06a481f928d6699") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              levelOfEducation: { $in: optionName },
              levelOfEducationShow: { $eq: true },
            });
          }
          if (fil.filterId == "618909a2fec3b250c029cae2") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              ethnicityShow: { $eq: true },
              ethnicity: { $in: optionName },
            });
          }
          if (fil.filterId == "61890a10fec3b250c029cb00") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              politicalAffiliation: { $in: optionName },
              politicalAffiliationShow: { $eq: true },
            });
          }
          if (fil.filterId == "61890a36fec3b250c029cb0a") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              religiousAffiliation: { $in: optionName },
              religiousAffiliationShow: { $eq: true },
            });
          }
          if (fil.filterId == "61890a4efec3b250c029cb0f") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              sexualOrientation: { $in: optionName },
              sexualOrientationShow: { $eq: true },
            });
          }
          if (fil.filterId == "619e0cf5641d2f00f887ece1") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            criteria.push({
              gender: { $in: optionName },
              gendereShow: { $eq: true },
            });
          }
          if (fil.filterId == "619e0cec641d2f00f887ecdc") {
            let optionName = [];
            fil?.options?.map((opt) => {
              optionName.push(opt.optionName);
            });
            let opts = optionName;
            for (let i = 0; i < opts.length; i++) {
              const value = opts[i].split("-");
              // // console.log("VAL - 1 = ", value[0]);
              // // console.log("VAL - 2 = ", value[1]);
              renge.push({
                age: { $gte: parseInt(value[0]), $lte: parseInt(value[1]) },
              });
            }
            let usersdata = await global.models.GLOBAL.USER.aggregate([
              {
                $match: {
                  $and: [
                    { _id: { $nin: user._id } },
                    { formFilled: { $eq: true } },
                    { userType: { $ne: "admin" } },
                  ],
                },
              },
              {
                $project: {
                  // password: 0,
                  date: {
                    $dateFromString: {
                      dateString: "$DOB",
                    },
                  },
                },
              },
              {
                $addFields: {
                  age: {
                    $round: [
                      {
                        $divide: [
                          { $subtract: [Date.now(), "$date"] },
                          365 * 24 * 60 * 60 * 1000,
                        ],
                      },
                      0,
                    ],
                  },
                },
              },
              {
                $match: {
                  $or: [...renge],
                },
              },
              {
                $project: {
                  _id: "$_id",
                  test: "test",
                },
              },
              {
                $group: {
                  _id: "$test",
                  array: { $push: "$_id" },
                },
              },
              {
                $project: {
                  array: 1,
                  _id: 0,
                },
              },
            ]);
            if (usersdata) {
              criteria.push({
                _id: { $in: usersdata[0].array },
                DOBShow: { $eq: true },
              });
            }
          }
        }

        // // console.log("criteria--->>", criteria);
        // // console.log("AGE--->", ...renge);
        // // console.log("usersdata", usersdata[0].array);

        distinctUser = await global.models.GLOBAL.USER.find(
          {
            $and: [
              { _id: { $nin: user._id } },
              {
                $or: criteria,
              },
            ],
          },
          { password: 0 }
        );
      } else {
        req.query.page = req.query.page ? req.query.page : 1;
        let page = parseInt(req.query.page);
        req.query.limit = req.query.limit ? req.query.limit : 10;
        let limit = parseInt(req.query.limit);
        let skip = (parseInt(req.query.page) - 1) * limit;
        distinctUser = await global.models.GLOBAL.USER.find(
          {
            $and: [
              { _id: { $nin: user._id } },
              { formFilled: { $eq: true } },
              { userType: { $ne: "admin" } },
            ],
          },
          { password: 0 }
        )
          .skip(skip)
          .limit(limit);
      }
      let findConection = await global.models.GLOBAL.CONNECTION.find({
        senderId: user._id,
      });
      let pandingConnection = await global.models.GLOBAL.CONNECTION.find({
        receiverId: user._id,
      });

      const sentIdExist = (id) => {
        // // console.log("INSENT--->>", id);
        let check = findConection.filter(function (elc) {
          return elc.receiverId.toString() === id.toString();
        });
        return check.length;
      };

      const pandingIdExist = (id) => {
        // // console.log("INPENDING--->>", id);
        let panding = pandingConnection.filter(function (elf) {
          return elf.senderId.toString() === id.toString();
        });
        return panding.length;
      };

      const conectIdExist = (id) => {
        return user.accepted.length
          ? user.accepted.some(function (el) {
              return el.toString() === id.toString();
            })
          : false;
      };
      let allUser = [];
      for (let i = 0; i < distinctUser.length; i++) {
        if (conectIdExist(distinctUser[i]?._id)) {
          const searchUserObj = {
            searchUser: distinctUser[i],
            isFriend: "true",
          };
          allUser.push(searchUserObj);
        } else if (sentIdExist(distinctUser[i]?._id)) {
          let findConnection = await global.models.GLOBAL.CONNECTION.findOne({
            senderId: user._id,
            receiverId: distinctUser[i]?._id,
          });
          const searchUserObj = {
            searchUser: distinctUser[i],
            isFriend: "sent",
            connection: findConnection,
          };
          allUser.push(searchUserObj);
        } else if (pandingIdExist(distinctUser[i]?._id)) {
          let findConnection = await global.models.GLOBAL.CONNECTION.findOne({
            senderId: distinctUser[i]?._id,
            receiverId: user._id,
          });
          const searchUserObj = {
            searchUser: distinctUser[i],
            isFriend: "pending",
            connection: findConnection,
          };
          allUser.push(searchUserObj);
        } else {
          const searchUserObj = {
            searchUser: distinctUser[i],
            isFriend: "false",
          };
          allUser.push(searchUserObj);
        }
      }
      if (allUser.length == 0) {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_FETCHED,
          payload: { allUser },
          logPayload: false,
        };
        return res
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
      return res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
