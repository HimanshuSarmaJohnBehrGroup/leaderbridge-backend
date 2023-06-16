const createQuestion = require("./create-question");
const createQuestionShare = require("./create-question-share");
const getQuestion = require("./get-question");
const updateQuestion = require("./update-status-of-question");
const questionUpdate = require("./update-question");
const deletedQuestion = require("./delete-question");
const removeForUser = require("./remove-question-for-user");
const questionWithFilter = require("./get-question-with-filter");
const reportQuestion = require("./report-abuse");
const getReportedQuestion = require("./get-reported-question");
const acceptAbuse = require("./accept-abuse-reason");
const declineRequest = require("./decline-abuse-request");
const searchQuestion = require("./get-search-api");
const getQuestionAdmin = require("./get-question-admin");
const getQuestionAdminAll = require("./get-question-admin-all");
const acceptReportedQuestion = require("./accept-reported-question");
const getQuestionByAnswer = require("./get-question-answer");
const QuestionRoom = require("./update-question-room");
const RemoveDummyUser = require("./remove-dummy-user");
module.exports = exports = {
  createQuestion,
  getQuestion,
  updateQuestion,
  questionUpdate,
  deletedQuestion,
  removeForUser,
  questionWithFilter,
  reportQuestion,
  getReportedQuestion,
  acceptAbuse,
  declineRequest,
  searchQuestion,
  getQuestionAdmin,
  acceptReportedQuestion,
  createQuestionShare,
  getQuestionAdminAll,
  getQuestionByAnswer,
  QuestionRoom,
  RemoveDummyUser,
};
