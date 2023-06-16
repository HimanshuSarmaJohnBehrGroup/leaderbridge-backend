const addAnswer = require("./add-answer");
const getAnswer = require("./get-answer");
const updateAnswer = require("./update-answer");
const deleteAnswer = require("./delete-answer");
const answerLater = require("./add-answer-later");
const getShareQuestion = require("./add-share-question");
const getAnswerLater = require("./get-answer-later");
const removeAnswerLater = require("./remove-answer-later");
const getAnswerByQuestion = require("./get-answer-by-question");
const removeAnswer = require("./remove-answer");
const answerByUser = require("./answer-by-user");
const answerRoomById = require("./get-answer-room-by-id");
const addAnswerInAsked = require("./add-answer-in-asked-question");
const starAnswer = require("./star-message");
const removeRoomAnswer = require("./delete-into-room");
const abuseAnswer = require("./abuse-answer");
const acceptAbuse = require("./accept-abuse-reason-answer");
const declineAbuse = require("./decline-abuse-request-answer");
const everyoneAnswer = require("./answer-everyone");
const onlyAdmin = require("./answer-admin");
const WhoCanseeAnswer = require("./who-can-see");
const getAbuseQuestion = require("./get-abuse-question");
const GroupResponses = require("./group-response");
const CheckConnection = require("./check-connection");
module.exports = exports = {
  addAnswer,
  getAnswer,
  updateAnswer,
  deleteAnswer,
  answerLater,
  getAnswerLater,
  removeAnswerLater,
  getAnswerByQuestion,
  removeAnswer,
  answerByUser,
  answerRoomById,
  addAnswerInAsked,
  starAnswer,
  removeRoomAnswer,
  abuseAnswer,
  acceptAbuse,
  declineAbuse,
  everyoneAnswer,
  onlyAdmin,
  WhoCanseeAnswer,
  getAbuseQuestion,
  getShareQuestion,
  GroupResponses,
  CheckConnection,
};
