"use strict";

const JwtStrategy = require("passport-jwt").Strategy;
const passport = require("passport");
const { isEmpty } = require("lodash");

const enums = require("../../json/enums.json");

const jwtOptions = require("./jwt-options");
const logger = require("../logger");

const { NODE_ENV = "local" } = process.env;

module.exports.setup = () => {
  /** JWT strategy */
  passport.use(
    new JwtStrategy(jwtOptions, (req, jwt_payload, next) => {
      const { id, environment, email, scope, rolename, userType } = jwt_payload;

      console.log("AAAAAAASSSSSSDDDDD", jwt_payload); // roleId, date and phone are unused...
      const reqInfo = `REQ [${req.requestId}] [${req.method}] ${req.originalUrl}`;
      logger.info(
        `${reqInfo} - #JwtStrategy - payload: ${JSON.stringify(jwt_payload)}`
      );

      // let model;
      let criteria;

      if (isEmpty(email)) {
        criteria = {
          _id: id,
          "status.name": { $ne: enums.USER_STATUS.DISABLED },
          userType: userType,
        };
      } else {
        criteria = {
          email: email.toLowerCase(),
          "status.name": { $ne: enums.USER_STATUS.DISABLED },
          userType: userType,
        };
      }

      console.log("TTTTTTTTTTTTTTTTTTTTTT", criteria);

      global.models.GLOBAL.USER.findOne(criteria)
        .lean() // This will return a simple JSON from database - no modifications to database are possible.
        .then((object) => {
          console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", object);
          if (!object) {
            logger.info("#JwtStrategy - No entry found!");
            next(null, false);
          } else {
            // logger.info("#JwtStrategy - Entry found!");
            if (email) {
              object.scope = scope;
              next(null, object);
            }
          }
        })
        .catch((error) => {
          logger.error(
            `#JwtStrategy - Error encountered: ${error.message}\n${error.stack}`
          );
          next(null, false);
        });
    })
  );
};
