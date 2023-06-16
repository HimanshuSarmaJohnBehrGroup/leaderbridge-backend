const _ = require("lodash");
const accepts = require("accepts");
const crypto = require("crypto");
const flatten = require("flat");
const logger = require("./logger");
const { default: jwtDecode } = require("jwt-decode");
const multer = require("multer");
const multerS3 = require("multer-s3");
var AWS = require("aws-sdk");
const md5 = require("md5");
const { s3Config } = require("./middlewares/config");
const bcrypt = require("bcrypt");
AWS.config.update({
  accessKeyId: s3Config.clientId,
  secretAccessKey: s3Config.clientSecret,
  region: s3Config.region,
});

const s3 = new AWS.S3();
let functions = {};

functions.config4hashes = {
  // size of the generated hash
  hashBytes: 32,
  // larger salt means hashed passwords are more resistant to rainbow table, but
  // you get diminishing returns pretty fast
  saltBytes: 16,
  // more iterations means an attacker has to take longer to brute force an
  // individual password, so larger is better. however, larger also means longer
  // to hash the password. tune so that hashing the password takes about a
  // second
  iterations: 872791,
};

functions.comparePassword = async (pass, hash) =>
  await bcrypt.compare(pass, hash);
/* create response-wrapper object */
functions.createResponseObject = ({
  req,
  result = 0,
  message = "",
  payload = {},
  logPayload = false,
  status,
}) => {
  let payload2log = {};
  if (logPayload) {
    payload2log = flatten({ ...payload });
  }

  let messageToLog = `RES [${req.requestId}] [${req.method}] ${req.originalUrl}`;
  messageToLog +=
    (!_.isEmpty(message) ? `\n${message}` : "") +
    (!_.isEmpty(payload) && logPayload
      ? `\npayload: ${JSON.stringify(payload2log, null, 4)}`
      : "");

  if (result < 0 && (result !== -50 || result !== -51)) {
    logger.error(messageToLog);
  } else if (!_.isEmpty(messageToLog)) {
    logger.info(messageToLog);
  }

  return { result: result, message: message, payload: payload, status: status };
};

/* Return true if the app is in production mode */
functions.isLocal = () => process.env.APP_ENVIRONMENT.toLowerCase() === "local";

/* Return true if the app is in production mode */
functions.isProduction = () =>
  process.env.APP_ENVIRONMENT.toLowerCase() === "production" ||
  process.env.APP_ENVIRONMENT.toLowerCase() === "prod";

/* Return true if the app is in production mode */
functions.isTest = () => process.env.APP_ENVIRONMENT.toLowerCase() === "test";

/* Mask a name to initials - e.g., change Bhargav Butani to A. B. */

// functions.passwordHash = (password) =>
//   crypto.createHash("sha512").update(password.toString()).digest("hex");
functions.passwordHash = (password) => md5(password);

/** Sort a JSON by keys */
functions.sortByKeys = (obj) => {
  if (_.isEmpty(obj)) {
    return obj;
  }

  const sortedObj = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sortedObj[key] = obj[key];
    });

  return sortedObj;
};
/* This has to be the last line - add all functions above. */

functions.serviceImageUploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: s3Config.bucket,
    // acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // console.log("file[0]", file);
      cb(
        null,
        "leader-bridge/service/" +
          "-" +
          "ser" +
          "-" +
          Date.now().toString() +
          "." +
          file.mimetype.split("/")[file.mimetype.split("/").length - 1]
      );
    },
    shouldTransform: function (req, file, cb) {
      cb(null, /^image/i.test(file.mimetype));
    },
    // transforms: [
    //   {
    //     id: "original",
    //     transform: function (req, file, cb) {
    //       //Perform desired transformations
    //       cb(null, sharp().resize(600, 600).max());
    //     },
    //   },
    // ],
  }),
});

functions.mediaDeleteS3 = function (filename, callback) {
  // console.log(filename);
  var s3 = new AWS.S3();
  var params = {
    Bucket: s3Config.bucket,
    Key: filename,
  };

  s3.deleteObject(params, function (err, data) {
    if (data) {
      // console.log("file deleted", data);
    } else {
      // console.log("err in delete object", err);
      // callback(null);
    }
  });
};

functions.uploadBase = async function (profileImage, subject) {
  const base64Data = Buffer.from(
    profileImage.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  const type = profileImage.split(";")[0].split("/")[1];
  const params = {
    Bucket: process.env.bucket,
    Key: `${subject}.${type}`, // type is not required
    Body: base64Data,
    // ACL: "public-read",
    ContentEncoding: "base64", // required
    ContentType: `image/${type}`, // required. Notice the back ticks
  };

  let location = "";
  let key = "";
  try {
    const { Location, Key } = await s3.upload(params).promise();
    location = Location;
    key = Key;
    return location;
  } catch (error) {
    // console.log("image upload error --> ", error);
  }
};

functions.getHeaderFromToken = async (token) => {
  const decodedToken = jwtDecode(token, {
    complete: true,
  });
  if (!decodedToken) {
    return null;
  }

  return decodedToken;
};

module.exports = exports = functions;
