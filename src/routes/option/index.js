const express = require("express");
const router = express.Router();
const Api = require("../../api/option");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Get Methods
router.get(
  "/get-all",
  Api.getAll.handler
);
router.get(
  "/get-by-id/:id",
  Api.getById.handler
);

// Post Methods
router.post(
  "/create",
  // passport.authenticate(["jwt"], { session: false }),
  validate("body", Api.createItem.validation),
  Api.createItem.handler
);

// Put Methods
router.put(
  "/updateItem/:id",
  passport.authenticate(["jwt"], { session: false }),
  Api.updateItem.handler
);

// Delete Methods
router.delete(
  "/deleteItem/:id",
  passport.authenticate(["jwt"], { session: false }),
  Api.deleteItem.handler
);

module.exports = exports = router;
