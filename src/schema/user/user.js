const mongoose = require("mongoose");
module.exports = (connection) => {
  const userSchema = new mongoose.Schema({
    profileImage: { type: String, default: null },
    name: String,
    email: String,
    password: String,
    isOnline: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    formFilled: { type: Boolean, default: false },
    pwReset: { type: Boolean, default: null },
    userType: { type: String, default: "user" },
    checkbox: { type: Boolean },
    createdAt: { type: Date },
    updatedAt: { type: Date, default: Date.now },
    createdBy: {
      type: String,
      default: "Admin",
    },
    updatedBy: {
      type: String,
      default: "Admin",
    },
    abuseQuestion: [],
    abuseAnswer: [],
    answerLater: [{ type: mongoose.Schema.Types.ObjectId }],
    removeQuestion: [{ type: mongoose.Schema.Types.ObjectId }],
    blockUser: [{ type: mongoose.Schema.Types.ObjectId }],
    // The accepted array stores ids  of all users whose connection request I have accepted.
    accepted: [],
    // The matched array stores ids of all users that have matched with me in the swipe page.
    // After matching, a chat room will also open automatically between me and the user that I have matched.
    matched: [{ type: mongoose.Schema.Types.ObjectId }],
    lastLogin: { type: Date, default: Date.now },
    token: { type: String, default: null },
    status: { type: Boolean, default: true },
    isSubmit: { default: false },
    message: { type: String, default: null },
    text: { type: String, default: null },
    organizationName: { type: String, default: null },
    currentRole: { type: String, default: null },
    region: { type: String, default: null },
    organizationEmail: { type: String, default: null },
    organizationEmailVerified: { type: Boolean, default: false },
    linkedinProfile: { type: String, default: null },
    organizationWebsite: { type: String, default: null },
    programWebsite: { type: String, default: null },
    otherLink: { type: String, default: null },
    howDidFind: { type: String, default: null },
    subject: { type: Array, default: [] },

    //  Start of user profile
    // regionShow: { type: Boolean, default: false },
    // currentRoleShow: { type: Boolean, default: false },
    // DOB: { type: String, default: null },
    // DOBShow: { type: Boolean, default: false },
    // countryOfOrigin: { type: Array, default: [] },
    // TypeofStartup: { type: Array, default: [] },
    // TypeofStartupShow: { type: Boolean, default: false },
    // countryOfOriginShow: { type: Boolean, default: false },
    // numberOfcompanyShow: { type: Boolean, default: false },
    // yourCompanyFoundedShow: { type: Boolean, default: false },
    // numberOffulltimeStaffShow: { type: Boolean, default: false },
    // fundingRoundStatusShow: { type: Boolean, default: false },
    // targetMarketShow: { type: Boolean, default: false },
    // gender: { type: String, default: null },
    // gendereShow: { type: Boolean, default: false },
    // countryOfResidence: { type: String, default: null },
    // countryOfResidenceShow: { type: Boolean, default: false },
    // industry: { type: String, default: null },
    // industryShow: { type: Boolean, default: false },
    // employeeNumber: { type: String, default: null },
    // employeeNumberShow: { type: Boolean, default: false },
    // ethnicity: { type: Array, default: [] },
    // numberOfcompany: { type: Array, default: [] },
    // yourCompanyFounded: { type: Array, default: [] },
    // numberOffulltimeStaff: { type: Array, default: [] },
    // fundingRoundStatus: { type: Array, default: [] },
    // targetMarket: { type: Array, default: [] },
    // StartupOrganization: { type: Array, default: [] },
    // StartupOrganizationShow: { type: Boolean, default: false },
    // ethnicityShow: { type: Boolean, default: false },
    // politicalAffiliation: { type: String, default: null },
    // politicalAffiliationShow: { type: Boolean, default: false },
    // religiousAffiliation: { type: String, default: null },
    // religiousAffiliationShow: { type: Boolean, default: false },
    // levelOfEducation: { type: String, default: null },
    // levelOfEducationShow: { type: Boolean, default: false },
    // sexualOrientation: { type: String, default: null },
    // sexualOrientationShow: { type: Boolean, default: false },

    //  End of user profile
    notificationSound: { type: Boolean, default: true },
    messageSound: { type: Boolean, default: true },
    deviceToken: { type: String, default: "1234" },
    organizationId: { type: String, default: null },
    fname: { type: String, default: null },
    lname: { type: String, default: null },
    programName: { type: String, default: null },
    programType: { type: mongoose.Schema.Types.ObjectId, default: null },
    permission: { type: Boolean, default: false },
    isOrganization: { type: Boolean, default: false },
    paymentVerified: { type: Boolean, default: false },
    organizationLogo: { type: String, default: null },
    organizationDescription: { type: String, default: null },
    emailVerified: { type: Boolean, default: false },
    isAdminEmail: { type: Boolean, default: false },
    OrgRanDomID: { type: String, default: null },
    phone: { type: String, default: null },
    isCompany: { type: String, default: null },
    isCompanyVerify: { type: Boolean, default: null },
    isCompanyId: { type: String, default: null },
    userpurchasing: { type: String, default: null },
    planduration: { type: String, default: null },
    regular: { type: String, default: null },
    preLaunch: { type: String, default: null },
    skipPayment: { type: Boolean, default: false },
    shareQuestion: [{ type: mongoose.Schema.Types.ObjectId }],
    fullyVerifiedSkip: { type: Boolean, default: false },
    fullyVerified: { type: Boolean, default: false },
    displayProfile: { type: Boolean, default: false },
  });
  return connection.model("user", userSchema, "user");
};
