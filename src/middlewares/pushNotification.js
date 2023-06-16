var admin = require("firebase-admin");
var serviceAccount = require("../../service-account.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const options = {
  priority: "high",
  timeToLive: 60 * 60 * 24,
};

const sendPushNotification = async (data) => {
  await admin
    .messaging()
    .sendToDevice(data.firebaseToken, data.payload, options)
    .then(function (response) {
      console.log("response--notification", response.results[0]);
      return response;
    })
    .catch(function (error) {
      // console.log("Error sending message:", error);
      return error;
    });
};

module.exports = {
  sendPushNotification,
};
