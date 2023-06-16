const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const moment = require("moment");
const { ObjectId } = require("mongodb");

// Get User by ID
module.exports = exports = {
  handler: async (req, res) => {
    let { user } = req;
    let { userId } = req.query;
    let criteria = {};
    let checkValid = {};

    let Usertype = await global.models.GLOBAL.USER.find({
      _id: ObjectId(userId),
    });

    if (Usertype[0]?.userType === enums.USER_TYPE.USER) {
      if (userId) {
        criteria = {
          _id: userId,
        };
      } else {
        criteria = {
          _id: user._id,
        };
      }

      if (userId) {
        checkValid = {
          userId: userId,
        };
      } else {
        checkValid = {
          userId: user._id,
        };
      }
    }

    if (Usertype[0]?.userType === enums.USER_TYPE.ADMIN) {
      if (!userId) {
        criteria = {
          userType: enums.USER_TYPE.USER,
        };
      }
      if (userId) {
        criteria = {
          _id: userId,
        };
      }

      if (!userId) {
        criteria = {};
      }
      if (userId) {
        checkValid = {
          userId: user._id,
        };
      }
    }

    try {
      let questionCount;
      let answerCount;
      let findUser = await global.models.GLOBAL.USER.find(criteria)
        .sort({
          createdAt: -1,
        })
        .populate({
          path: "abuseQuestion.questionId",
          model: "question",
          select: "_id question",
        })
        .populate({
          path: "abuseAnswer.answerId",
          model: "answer",
          select: "_id answer",
        });

      const checkVerifed = await global.models.GLOBAL.FULLYVERIFYSATUS.findOne(
        checkValid
      );

      let count = await global.models.GLOBAL.USER.count(criteria);
      if (userId) {
        questionCount = await global.models.GLOBAL.QUESTION.count({
          createdBy: userId,
        });
        answerCount = await global.models.GLOBAL.ANSWER.count({
          createdBy: userId,
        });
      } else {
        questionCount = await global.models.GLOBAL.QUESTION.count({
          createdBy: user._id,
        });
        answerCount = await global.models.GLOBAL.ANSWER.count({
          createdBy: user._id,
        });
      }

      var today = new Date();
      var MonthEnd = today.getMonth();
      var Months = MonthEnd < 10 ? "0" + MonthEnd : MonthEnd;

      var DateFormate =
        today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
      var date = today.getFullYear() + "-" + Months + "-" + DateFormate;
      var TimeMent =
        today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
      var time = today.getHours() + ":" + TimeMent + ":" + today.getSeconds();
      var dateTime = date + " " + time;
      var rrrrr = date + "T" + time + "Z";

      let TodayUser = await global.models.GLOBAL.USER.find({
        createdAt: {
          $gte: new Date(today.getFullYear(), Months, DateFormate),
          // $gte: rrrrr,
        },
      });

      const startOfMonth = moment().utc().startOf("month").format();
      const endOfMonth = moment().utc().endOf("month").format();

      console.log("startOfMonth", startOfMonth);
      console.log("endOfMonth", endOfMonth);

      const ThisMonthUsers = await global.models.GLOBAL.USER.find({
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth,
          // $gte: rrrrr,
        },
      });

      const LastMonthOfStart = moment()
        .utc()
        .subtract(1, "months")
        .startOf("month")
        .utc()
        .format();
      const LastMonthOfend = moment()
        .utc()
        .subtract(1, "months")
        .endOf("month")
        .utc()
        .format();

      const LastMonthUsers = await global.models.GLOBAL.USER.find({
        createdAt: {
          $gte: LastMonthOfStart,
          $lte: LastMonthOfend,
          // $gte: rrrrr,
        },
      });

      const LastThreeMonthOfStart = moment()
        .utc()
        .subtract(3, "months")
        .startOf("month")
        .utc()
        .format();
      const LastThreeMonthOfend = moment()
        .utc()
        .subtract(3, "months")
        .endOf("month")
        .utc()
        .format();

      const LastThreeMonthUsers = await global.models.GLOBAL.USER.find({
        createdAt: {
          $gte: LastThreeMonthOfStart,
          $lte: LastThreeMonthOfend,
          // $gte: rrrrr,
        },
      });

      let IndependentUsers = await global.models.GLOBAL.USER.find({
        isCompanyVerify: true,
        isCompany: "individualCompany",
      });

      let TotalCompany = await global.models.GLOBAL.USER.find({
        isCompanyVerify: true,
        isCompanyId: {
          $ne: null,
        },
      });

      let TotalOrganization = await global.models.GLOBAL.USER.find({
        isOrganization: true,
        OrgRanDomID: {
          $ne: null,
        },
      });
      // convert to unix time to format utc time after code uncomment
      console.log("AASSSEESSSDDDSDDSDDSS", new Date("01-01-2023"));
      const startOfMonthCurrent = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      );
      const endOfMonthCurrent = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      );

      const users = await global.models.GLOBAL.USER.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonthCurrent, $lte: endOfMonthCurrent },
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: "$createdAt" },
            users: { $sum: 1 },
          },
        },
      ]).sort({ _id: 1 });

      const totalYear = await global.models.GLOBAL.USER.aggregate([
        {
          $group: {
            _id: { $year: "$createdAt" },
            users: { $sum: 1 },
          },
        },
      ]).sort({ _id: 1 });

      console.log("AAAASSSDDDFFFFF", totalYear);

      for (let i = 0; i < users?.length; i++) {
        // users[i]._id =
        //   new Date().getFullYear() +
        //   "-" +
        //   new Date().getMonth() +
        //   "-" +
        //   users[i]._id;

        users[i]._id = `${users[i]._id}th`;
      }

      for (let i = 0; i < totalYear?.length; i++) {
        // if (users[i]?._id == new Date().getMonth() + 1) {
        //   users.splice(i, 1);
        // }

        if (totalYear[i]?._id == null) {
          totalYear[i]._id = 2019;
        }

        // settotalMonthName(totalmonth[i]?._id)
      }

      if (!findUser) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.USER_DOES_NOT_EXIST,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.NOT_FOUND)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        findUser = JSON.parse(JSON.stringify(findUser));
        delete findUser.password;
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.USER_FETCH_SUCCESS,
          payload: {
            findUser,
            checkVerifed,
            questionCount,
            answerCount,
            count,
            todaysCount: TodayUser.length,
            TotalCompany: TotalCompany.length,
            TotalOrganization: TotalOrganization.length,
            IndependentUsers: IndependentUsers.length,
            ThisMonthUsers: ThisMonthUsers.length,
            LastMonthUsers: LastMonthUsers.length,
            LastThreeMonthUsers: LastThreeMonthUsers.length,
            totalmonth: users,
            totalYear: totalYear,
          },
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
