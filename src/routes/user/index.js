const express = require("express");
const router = express.Router();
const api4User = require("../../api/user/index");
const updateStatus = require("../../api/user/index");
const { validate } = require("../../middlewares");
const passport = require("passport");
const { serviceImageUploadS3 } = require("../../utils");

// Get Method
router.get(
  "/",
  passport.authenticate(["jwt"], { session: false }),
  api4User.getUser.handler
);

router.get(
  "/verification-data/",
  // passport.authenticate(["jwt"], { session: false }),
  api4User.CustomerKey.handler
);

router.get(
  "/get-verification-status/",
  passport.authenticate(["jwt"], { session: false }),
  api4User.getVerificationStatus.handler
);

// router.get(
//   "/get-verification-status",
//   passport.authenticate(["jwt"], { session: false }),
//   api4User.getVerificationStatus.handler
// );

router.post(
  "/verification-status/id=:userId",
  serviceImageUploadS3.fields([
    { name: "user_image" },
    { name: "document_image_front" },
    { name: "document_image_back" },
  ]),
  // passport.authenticate(["jwt"], { session: false }),
  api4User.verificationStatus.handler
);

router.post(
  "/online-check",

  passport.authenticate(["jwt"], { session: false }),
  api4User.onlineOfline.handler
);

router.get("/userSheet", api4User.GetSheetUser.handler);

router.get(
  "/all-user",
  passport.authenticate(["jwt"], { session: false }),
  api4User.getAllUser.handler
);
router.get("/get-user-id", api4User.GetIdUser.handler);

router.get(
  "/submited-user",
  // passport.authenticate(["jwt"], { session: false }),
  api4User.submiteduser.handler
);
// get all users chose type is only user
router.get(
  "/all-users",
  passport.authenticate(["jwt"], { session: false }),
  api4User.getUsers.handler
);

router.get(
  "/get-deactive",
  passport.authenticate(["jwt"], { session: false }),
  api4User.getdeActiveUser.handler
);

router.get(
  "/all-users-organization",
  // passport.authenticate(["jwt"], { session: false }),
  api4User.getOrganization.handler
);

router.get(
  "/get-user-reset",
  // passport.authenticate(["jwt"], { session: false }),
  api4User.CronReset.ResetHandler
);

router.get(
  "/get-user-pricing",
  // passport.authenticate(["jwt"], { session: false }),
  api4User.PricingUser.handler
);

router.get(
  "/all-admin-organization",
  passport.authenticate(["jwt"], { session: false }),
  api4User.getAdminOrganization.handler
);

router.get(
  "/all-admin-company",
  passport.authenticate(["jwt"], { session: false }),
  api4User.getAdminCompany.handler
);

router.get(
  "/blockList",
  passport.authenticate(["jwt"], { session: false }),
  api4User.getBlockuser.handler
);

router.get(
  "/topUser",
  passport.authenticate(["jwt"], { session: false }),
  api4User.topUser.handler
);
router.get(
  "/count",
  passport.authenticate(["jwt"], { session: false }),
  api4User.getCount.handler
);
router.get(
  "/agora",
  // passport.authenticate(["jwt"], { session: false }),
  api4User.agoraToken.handler
);

// Post Methods
router.post(
  "/registration",
  validate("body", api4User.userRegistration.validation),
  api4User.userRegistration.handler
);

router.post(
  "/login",
  validate("body", api4User.userLogin.validation),
  api4User.userLogin.handler
);

router.post(
  "/organization-signup",
  validate("body", api4User.organizationSignUp.validation),
  api4User.organizationSignUp.handler
);

router.post(
  "/reset",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4User.resetPassword.validation),
  api4User.resetPassword.handler
);

router.post(
  "/de-activate",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", api4User.deactivateAccount.validation),
  api4User.deactivateAccount.handler
);

router.post(
  "/search/",
  passport.authenticate(["jwt"], { session: false }),
  api4User.searchUser.handler
);

router.get(
  "/get-logo-institution",
  passport.authenticate(["jwt"], { session: false }),
  api4User.GetLogoInstituion.handler
);

router.post(
  "/reset/id=:userId",
  validate("body", api4User.updatePassword.validation),
  api4User.updatePassword.handler
);

router.post(
  "/matching/filter-with-users",
  passport.authenticate(["jwt"], { session: false }),
  // validate("body", api4User.updatePassword.validation),
  api4User.UpdateWithUsers.handler
);

// Put Method
router.put(
  "/verify-email",
  validate("body", api4User.verifyEmail.validation),
  api4User.verifyEmail.handler
);

router.put(
  "/verification-status-check-update/type=:type/id=:userId",
  // validate("body", api4User.verifyEmail.validation),
  api4User.checkVerificationStatus.handler
);

router.post(
  "/upload-image",
  serviceImageUploadS3.single("profileImage"),
  // passport.authenticate(["jwt"], { session: false }),
  // validate("body", api4User.verifyEmail.validation),
  api4User.uploadImage.handler
);

router.post(
  "/create-plan/id=:id",
  // serviceImageUploadS3.single("profileImage"),
  // passport.authenticate(["jwt"], { session: false }),
  // validate("body", api4User.verifyEmail.validation),
  api4User.CreatePlan.handler
);

router.get(
  "/get-company",

  passport.authenticate(["jwt"], { session: false }),
  // validate("body", api4User.verifyEmail.validation),
  api4User.getCompany.handler
);

router.get(
  "/get-image",
  // serviceImageUploadS3.single("profileImage"),
  // passport.authenticate(["jwt"], { session: false }),
  // validate("body", api4User.verifyEmail.validation),
  api4User.getUserImage.handler
);

router.get(
  "/get-payment-search/userId=:userId",
  // serviceImageUploadS3.single("profileImage"),
  // passport.authenticate(["jwt"], { session: false }),
  // validate("body", api4User.verifyEmail.validation),
  api4User.GetPaymentSearch.handler
);

// get send mail

router.post(
  "/send-mail",
  // validate("body", api4User.verifyEmail.validation),
  api4User.sendEmail.handler
);

router.put(
  "/verify-code",
  validate("body", api4User.verifyCode.validation),

  api4User.verifyCode.handler
);
router.put(
  "/verification-form",
  validate("body", api4User.userData.validation),
  api4User.userData.handler
);
router.put(
  "/",
  passport.authenticate(["jwt"], { session: false }),
  api4User.updateUSer.handler
);

router.put(
  "/update-organization-user",
  // passport.authenticate(["jwt"], { session: false }),
  api4User.getUpdateOrganization.handler
);
router.put(
  "/update-status/id=:userId&status=:status",
  // passport.authenticate(["jwt"], { session: false }),
  api4User.updateStatus.handler
);

router.put(
  "/form-submit/id=:userId&status=:status",
  // passport.authenticate(["jwt"], { session: false }),
  api4User.formsubmit.handler
);
router.put(
  "/block/id=:userId",
  passport.authenticate(["jwt"], { session: false }),
  api4User.blockUser.handler
);
router.put(
  "/unblock/id=:userId",
  passport.authenticate(["jwt"], { session: false }),
  api4User.unBlockUser.handler
);

router.put(
  "/skip-verified",
  // passport.authenticate(["jwt"], { session: false }),
  api4User.skipVerifed.handler
);

router.delete(
  "/verification-document/id=:id",
  passport.authenticate(["jwt"], { session: false }),
  api4User.deleteverifed.handler
);

router.put(
  "/forget",
  validate("body", api4User.forgetPassword.validation),
  api4User.forgetPassword.handler
);
router.put(
  "/work-email",
  validate("body", api4User.sendMailForWrokEmail.validation),
  passport.authenticate(["jwt"], { session: false }),
  api4User.sendMailForWrokEmail.handler
);
router.put("/work-email/verify/id=:id", api4User.verifyWorkEmail.handler);

module.exports = exports = router;
