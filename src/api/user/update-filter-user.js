const { createCanvas, loadImage } = require("canvas");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Get User by ID
module.exports = exports = {
  handler: async (req, res) => {
    let { user } = req;

    console.log("userSSSSSSSSS", user);
    if (user.userType === enums.USER_TYPE.ADMIN) {
      try {
        let { email, name, currentRole } = req.body;
        let updateByAdmin = await global.models.GLOBAL.USER.findOneAndUpdate(
          {
            email: email.toLowerCase(),
          },
          {
            $set: {
              name: name,
              updatedAt: Date.now(),
              updatedBy: user.email,
              currentRole: currentRole,
            },
          },
          { new: true }
        );
        if (!updateByAdmin) {
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
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_UPDATED,
            payload: { updateByAdmin },
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
    } else {
      try {
        console.log("AAAASSSDDDDFFFFF", req.body.subject);
        // // console.log("IMAGE--->>", req.body.profileImage);
        if (req.body.subject) {
          const ImagesList = await global.models.GLOBAL.LEGENDS.aggregate([
            {
              $match: { legendsName: { $in: req.body.subject } },
            },
            {
              $group: {
                _id: "$legendsIcon",
                legendsName: {
                  $first: "$legendsName",
                },
              },
            },
          ]);

          let ArraySubject = [];
          req.body.subject.map((item, index) => {
            return ImagesList.map((ss, i) => {
              if (ss.legendsName == item) {
                ArraySubject.splice(index, 0, ss);
              }
            });
          });

          // // console.log("LIST LENGHT", ImagesList?.length);

          if (ArraySubject.length !== 4) {
            return res.status(400).json({
              message: "Please provide 4 images",
            });
          } else {
            console.log("QQQQQWEEEEEEEEEERRRRR", ArraySubject);
            const canvasWidth = 1024;
            const canvasHeight = 1024;
            //load canvas
            const myCanvas = createCanvas(canvasWidth, canvasHeight, "PNG");
            const context = myCanvas.getContext("2d");

            //load images && draw image in existing canvas

            let imageWidth = 0;
            let imageHeight = 0;
            for (i = 0; i < ArraySubject.length; i++) {
              await loadImage(ArraySubject[i]._id).then(async (image) => {
                context.drawImage(image, imageWidth, imageHeight);
                imageHeight =
                  canvasHeight > imageHeight * 2 ? imageWidth : imageHeight;
                imageWidth =
                  canvasWidth > imageWidth * 2 ? 0.5 * canvasHeight : 0;
              });
            }
            let findUser = await global.models.GLOBAL.USER.findOne({
              _id: user._id,
            });

            if (
              findUser.profileImage !== null ||
              findUser.profileImage !== undefined ||
              findUser.profileImage !== ""
            ) {
              // // console.log("profileImage", findUser.profileImage);
              const url = findUser?.profileImage?.split(".com/").slice(-1)[0];
              // // console.log(url);
              if (url) {
                utils.mediaDeleteS3(url, function (err) {
                  if (err) {
                    // console.log("s3 err", err);
                    return next(err);
                  }
                });
                req.body.profileImage = await utils.uploadBase(
                  myCanvas.toDataURL(),
                  req.body.subject
                );
                // // console.log("IF IMAGE-->>", req.body.profileImage);
              } else {
                req.body.profileImage = await utils.uploadBase(
                  myCanvas.toDataURL(),
                  req.body.subject
                );
                // // console.log("ELSE IMAGE-->>", req.body.profileImage);
              }
            }
          }
        }

        console.log("USER--->>req.body", req.body);

        let updateUser = await global.models.GLOBAL.USER.findByIdAndUpdate(
          { _id: user._id },
          {
            $set: {
              ...req.body,
              updatedAt: Date.now(),
              updatedBy: user.email,
            },
          },
          { new: true }
        );
        // // console.log("UPDATED--->>", updateUser);
        if (!updateUser) {
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
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_UPDATED,
            payload: { updateUser },
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
    }
  },
};
