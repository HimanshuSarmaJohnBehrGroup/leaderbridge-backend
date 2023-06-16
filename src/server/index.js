const express = require("express");
const {
  loadConfigurationFromFile,
  loadConfigurationFromDatabase,
} = require("./configuration-loader");
const initDataBase = require("./database");
const os = require("os");
const initMiddleware = require("./middlewares");
const initRouter = require("./router");
const http = require("http");
const cors = require('cors');
const webSocket = require("./socket-io");
const api4User = require("../api/user/index");
const compression = require("compression");
// const { ResetHandler } = require("../api/user/cronReset");
const debug = require("debug")("myapp");
global.config = {};
global.limits = {};
global.models = {};

const runServer = async () => {
  const redis = require("redis");

  const app = express();
  require("../polyfills");
  /* Logger */
  const logger = require("../logger");
  logger.info("Logger Initialized!");

  await loadConfigurationFromFile(logger);

  // Init Database connection
  await initDataBase(logger);

  // Init firestore Database
  // await initFirestore(logger);

  logger.info(`
    APP_ENVIRONMENT: ${process.env.APP_ENVIRONMENT}
    APP_NAME: ${process.env.APP_NAME}
    APP_PORT: ${process.env.APP_PORT}
    APP_RELEASE: ${process.env.APP_RELEASE}
    APP_VERSION: ${process.env.APP_VERSION}`);

  initMiddleware(app, logger);
  initRouter(app, logger);

  const server = http.createServer(app);

  // Init Socket.io
  await webSocket(server, logger);

  // Mail Service cron job

  var cron = require("node-cron");

  var api_cron = cron.schedule("* 9 * * *", () => {
    // User.sendReminderMailForCounselling(30, 31);
    // User.sendReminderMailForCounselling(10, 11);
    api4User.CronReset.ResetHandler();
    // api4User.PricingUser.ResetHandler();
  });

  // cron schedule for 7 : 00 pm every day

  var api_cron1 = cron.schedule("0 19 * * *", () => {
    api4User.PricingUser.handler();
  });


  app.use(cors({
    origin: '*'
  }));

  app.use(
    compression(
      {
        level: 9,
        threshold: 100 * 1024,
        filter: (req, res) => {
          if (req.headers["x-no-compression"]) {
            // don't compress responses with this request header
            return false;
          }
          // fallback to standard filter function
          return compression.filter(req, res);
        },
      },
      (err, stdout, stderr) => {
        if (err) {
          logger.error(`Error while compressing the file: ${err}`);
        }
        logger.info(`stdout: ${stdout}`);
        logger.info(`stderr: ${stderr}`);
      }
    )
  );

  server.listen(process.env.APP_PORT, async () => {
    logger.info(
      `${process.env.APP_RELEASE} server STARTED on port: ${process.env.APP_PORT}\n`
    );
    await global.models.GLOBAL.LOG({
      description: `${process.env.APP_RELEASE} server STARTED on port: ${process.env.APP_PORT}`,
      time: Date.now(),
      parameters: {},
    }).save();

    //* Additional info
    // const msg = `\`${process.env.APP_ENVIRONMENT}\` \`${os.hostname()}\` \`${process.env.APP_RELEASE}\` server *STARTED* on port \`${process.env.APP_PORT}\``;
    // logger.info(`${msg}`);
  });

  server.timeout = 120000;

  // process.setMaxListeners(30); // or set to Infinity
  process.on("SIGINT", () => {
    server.close(async () => {
      const convertToMB = (data) =>
        Math.round((data / 1024 / 1024) * 100) / 100;
      const formatMemoryUsage = (data) => `${convertToMB(data)} MB`;
      const memoryData = process.memoryUsage();
      const memoryUsage = {
        rss: `Total memory allocated: ${formatMemoryUsage(memoryData.rss)}, `,
        heapTotal: `Total heap size: ${formatMemoryUsage(
          memoryData.heapTotal
        )}, `,
        heapUsed: `Actual memory used during the execution: ${formatMemoryUsage(
          memoryData.heapUsed
        )}, `,
        external: `V8 external memory: ${formatMemoryUsage(
          memoryData.external
        )}`,
      };
      const usageInPercent = Number(
        (convertToMB(memoryData.heapUsed) * 100) /
          convertToMB(memoryData.heapTotal)
      ).toFixed(2);
      const usageText = `${memoryUsage.rss}\n${memoryUsage.heapTotal}\n${memoryUsage.heapUsed}\n${memoryUsage.external}\nHeap usage is: ${usageInPercent}%`;
      const msg = `\`${process.env.APP_ENVIRONMENT}\` \`${
        process.env.APP_RELEASE
      }\` \`${os.hostname()}\` server *STOPPED* on *SIGINT*\`\`\`${usageText}\`\`\``;
      logger.error(msg.replace(/\//g, "").replace(/`/g, ""));
    });
  });
  process.on("SIGTERM", () => {
    server.close(async () => {
      const convertToMb = (data) =>
        Math.round((data / 1024 / 1024) * 100) / 100;
      const formatMemoryUsage = (data) => `${convertToMb(data)} MB`;
      const memoryData = process.memoryUsage();
      const memoryUsage = {
        rss: `Total memory allocated: ${formatMemoryUsage(memoryData.rss)}, `,
        heapTotal: `Total heap size: ${formatMemoryUsage(
          memoryData.heapTotal
        )}, `,
        heapUsed: `Actual memory used during the execution: ${formatMemoryUsage(
          memoryData.heapUsed
        )}, `,
        external: `V8 external memory: ${formatMemoryUsage(
          memoryData.external
        )}`,
      };
      const usageInPercent = Number(
        (convertToMb(memoryData.heapUsed) * 100) /
          convertToMb(memoryData.heapTotal)
      ).toFixed(2);
      const usageText = `${memoryUsage.rss}\n${memoryUsage.heapTotal}\n${memoryUsage.heapUsed}\n${memoryUsage.external}\nHeap usage is: ${usageInPercent}%`;
      const msg = `\`${process.env.APP_ENVIRONMENT}\` \`${
        process.env.APP_RELEASE
      }\` \`${os.hostname()}\` server *STOPPED* on *SIGINT*\`\`\`${usageText}\`\`\``;
      logger.error(msg.replace(/\//g, "").replace(/`/g, ""));
    });
  });
};

module.exports = runServer;
