const mongoose = require("mongoose");
const logger = require("../logger");
const ConnectionFactory = require("./connection-factory");
const config = require("../../config.json");

module.exports = async () => {
  mongoose.pluralize(null); // So that mongoose doesn't try to pluralize the schema and map accordingly.
  let models;
  try {
    const connectionFactory = new ConnectionFactory(config);
    // GLOBAL Connections
    const connection_IN_LEADER_BRIDGE = await connectionFactory.getConnection(
      "GLOBAL",
      config.MONGODB.GLOBAL.DATABASE.LEADER_BRIDGE
    );

    const mongooseConnections = {
      GLOBAL: {
        LEADER_BRIDGE: connection_IN_LEADER_BRIDGE,
      },
    };

    /* All the (mongoose) models to be defined here */
    models = {
      GLOBAL: {
        LOG: require("../schema/log/log")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        CONTACT: require("../schema/contact/contact")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        CMS: require("../schema/cms/cms")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        CONTENT: require("../schema/Content/Content")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        FILTER: require("../schema/filter/filter")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        FILTER_TYPE: require("../schema/filter/filter-type")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        USER: require("../schema/user/user")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        QUESTION: require("../schema/question/question")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        ANSWER: require("../schema/answer/answer")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        CODE_REGISTRATION: require("../schema/code/code-registration")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        CODE_VERIFICATION: require("../schema/code/code-verification")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        CHAT: require("../schema/chat/chat")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        CHAT_ROOM: require("../schema/chat/chat-room")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        CONNECTION: require("../schema/connection/connection")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        LEGENDS: require("../schema/legends/legends")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        ANSWER_ROOM: require("../schema/answerRoom/answerRoom")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        NOTIFICATION: require("../schema/notification/notification")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        MATCHING: require("../schema/matching/matching")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        DROPDOWN: require("../schema/DropDown/dropdown")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),

        OPTION: require("../schema/option/option")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        REQUEST_PROFILE_ACCESS:
          require("../schema/requestProfileAccess/requestProfile")(
            mongooseConnections.GLOBAL.LEADER_BRIDGE
          ),

        // REQUEST_PROFILE_ACCESS:
        // require("../schema/requestProfileAccess/requestProfile")(
        //   mongooseConnections.GLOBAL.LEADER_BRIDGE
        // ),

        ANSWER_GROUP: require("../schema/answerGroup/group")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        PLAN: require("../schema/plan/plan")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        MYPLAN: require("../schema/myPlan/myPlan")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        FULLYVERIFYSATUS:
          require("../schema/fullyverify-verification-status/fully-verify-status")(
            mongooseConnections.GLOBAL.LEADER_BRIDGE
          ),

        USER_FILTER: require("../schema/user-filter/user-filter")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
        GRAPH: require("../schema/filterchart/filterChart")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),

        USER_GRAPH: require("../schema/filterchart/userChart")(
          mongooseConnections.GLOBAL.LEADER_BRIDGE
        ),
      },
    };

    return models;
  } catch (error) {
    logger.error(
      "Error encountered while trying to create database connections and models:\n" +
        error.stack
    );
    return null;
  }
};
