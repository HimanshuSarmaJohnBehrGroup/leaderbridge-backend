const enums = require("../../json/enums.json");
const messages = require("../../json/messages.json");

module.exports = (app, logger) => {
  // imports all route here

  const userRoute = require("../routes/user/index");
  const filterRoute = require("../routes/filter/index");
  const questionRoute = require("../routes/question/index");
  const contactRoute = require("../routes/contact/index");
  const cmsRoute = require("../routes/cms/index");
  const ContentRoute = require("../routes/Content/index");
  const answerRoute = require("../routes/answer/index");
  const chatRoute = require("../routes/chat/index");
  const connectionRoute = require("../routes/connection/index");
  const legendsRoute = require("../routes/legends/index");
  const notificationRoute = require("../routes/notification/index");
  const matchingRoute = require("../routes/matching/index");
  const newAnswerRoute = require("../routes/new_answer/index");
  const optionRoute = require("../routes/option/index");
  const planRoute = require("../routes/plan/index");
  const myPlanRoute = require("../routes/myPlan/index");
  const paymentRoute = require("../routes/payment/index");
  const graphRoute = require("../routes/filterChart/index");

  const dropdown = require("../routes/dropdown/index");
  // define all routes here
  const { createResponseObject } = require("../utils");

  app.use(["/api/v1/user"], userRoute);
  app.use(["/api/v1/filter"], filterRoute);
  app.use(["/api/v1/question"], questionRoute);
  app.use(["/api/v1/contact"], contactRoute);
  app.use(["/api/v1/cms"], cmsRoute);
  app.use(["/api/v1/content"], ContentRoute);
  app.use(["/api/v1/answer"], answerRoute);
  app.use(["/api/v1/chat"], chatRoute);
  app.use(["/api/v1/connection"], connectionRoute);
  app.use(["/api/v1/legend"], legendsRoute);
  app.use(["/api/v1/notification"], notificationRoute);
  app.use(["/api/v1/matching"], matchingRoute);
  app.use(["/api/v1/new-answer"], newAnswerRoute);
  app.use(["/api/v1/option"], optionRoute);
  app.use(["/api/v1/plan"], planRoute);
  app.use(["/api/v1/myPlan"], myPlanRoute);
  app.use(["/api/v1/payment"], paymentRoute);

  app.use(["/api/v1/dropdown"], dropdown);
  app.use(["/api/v1/option"], optionRoute);
  app.use(["/api/v1/graph"], graphRoute);
  /* Catch all */
  app.all("*", function (req, res) {
    res.status(enums.HTTP_CODES.BAD_REQUEST).json(
      createResponseObject({
        req: req,
        result: -1,
        message: "Sorry! The request could not be processed!",
        payload: {},
        logPayload: false,
      })
    );
  });

  // Async error handler
  app.use((error, req, res) => {
    logger.error(
      `${req.originalUrl} - Error caught by error-handler (router.js): ${error.message}\n${error.stack}`
    );
    const data4responseObject = {
      req: req,
      result: -999,
      message: messages.GENERAL,
      payload: {},
      logPayload: false,
    };

    return res
      .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
      .json(createResponseObject(data4responseObject));
  });
};
