const userRegistration = require("./registration");
const userLogin = require("./login");
const getUser = require("./get-user");
const verifyCode = require("./verify-code");
const verifyEmail = require("./verify-email");
const sendEmail = require("./send-mail");
const updateUSer = require("./update-user");
const updateStatus = require("./update-status");
const getAllUser = require("./get-all-user");
const getUsers = require("./get-users");
const searchUser = require("./search-user");
const userData = require("./user-data");
const resetPassword = require("./reset-password");
const deactivateAccount = require("./deactivate-account");
const blockUser = require("./block-user");
const unBlockUser = require("./unblock-user");
const getBlockuser = require("./get-block-user");
const getBlockstatus = require("./get-block-status");
const topUser = require("./top-user");
const updatePassword = require("./update-password");
const forgetPassword = require("./forget-password");
const getCount = require("./get-count");
const sendMailForWrokEmail = require("./sent-mail-work-email");
const agoraToken = require("./agora-token");
const verifyWorkEmail = require("./verify-work-email");
const updateOnlineStatus = require("./update-online-status");
const formsubmit = require("./Form-submit");
const submiteduser = require("./submited-user");
const organizationSignUp = require("./organization-signup");
const uploadImage = require("./upload-image");
const getUserImage = require("./get-user-image");
const getOrganization = require("./get-user-organization");
const getAdminOrganization = require("./get-admin-organization");
const getAdminCompany = require("./get-admin-company");
const getUpdateOrganization = require("./organization-user-update");
const getCompany = require("./get-company");
const CronReset = require("./cronReset");
const CreatePlan = require("./create-plan");
const UpdateWithUsers = require("./filter-with-users");
const GetPaymentSearch = require("./get-payment-search");
const GetSheetUser = require("./user-get-sheet");
const CustomerKey = require("./customer-kyc");
const verificationStatus = require("./verification-status");
const GetIdUser = require("./get-id-user");
const skipVerifed = require("./update-skip-verifed");
const getVerificationStatus = require("./get-verification-status");
const onlineOfline = require("./offine-online");
const deleteverifed = require("./delete-verificationData");
const getdeActiveUser = require("./get-deactive-user");
const checkVerificationStatus = require("./verification-check-status");
const GetLogoInstituion = require("./get-institution-logo");
const EditUniqueName = require("./edit-uniquename");
const PricingUser = require("./pricing-mail");
module.exports = exports = {
  userRegistration,
  userLogin,
  getUser,
  verifyCode,
  verifyEmail,
  sendEmail,
  updateUSer,
  updateStatus,
  getAllUser,
  getUsers,
  searchUser,
  userData,
  resetPassword,
  deactivateAccount,
  blockUser,
  unBlockUser,
  getBlockuser,
  topUser,
  updatePassword,
  forgetPassword,
  getCount,
  verifyWorkEmail,
  agoraToken,
  sendMailForWrokEmail,
  getBlockstatus,
  updateOnlineStatus,
  formsubmit,
  submiteduser,
  organizationSignUp,
  uploadImage,
  getUserImage,
  getOrganization,
  getAdminOrganization,
  getUpdateOrganization,
  CronReset,
  getCompany,
  getAdminCompany,
  CreatePlan,
  GetPaymentSearch,
  UpdateWithUsers,
  GetSheetUser,
  CustomerKey,
  verificationStatus,
  GetIdUser,
  skipVerifed,
  getVerificationStatus,
  onlineOfline,
  deleteverifed,
  getdeActiveUser,
  checkVerificationStatus,
  GetLogoInstituion,
  EditUniqueName,
  PricingUser,
};
