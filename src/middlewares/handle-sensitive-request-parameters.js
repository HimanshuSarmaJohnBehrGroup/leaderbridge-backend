const { isEmpty } = require("lodash");
const utils = require("../utils");

module.exports = exports = async (req, res, next) => {
  if (req.method.toUpperCase() === "POST") {
    /* Hash all user passwords */
    const { oldPassword, newPassword, password } = req.body;

    if (!isEmpty(password) && password.length > 0) {
      req.body.password = utils.passwordHash(password);
    }

    if (!isEmpty(oldPassword) && oldPassword.length > 0) {
      req.body.oldPassword = utils.passwordHash(oldPassword);
    }

    if (!isEmpty(newPassword) && newPassword.length > 0) {
      req.body.newPassword = utils.passwordHash(newPassword);
    }
  }

  next();
};
