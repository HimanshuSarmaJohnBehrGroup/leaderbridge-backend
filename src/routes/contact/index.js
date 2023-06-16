const express = require("express");
const router = express.Router();
const api4Filter = require("../../api/contact-us/index");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Get Method
router.get(
  "/getcontact",
  // passport.authenticate(["jwt"], { session: false }),
  api4Filter.getContact.handler
);

// POST Method
router.post(
  "/createcontact",
  // passport.authenticate(["jwt"], { session: false }),
  api4Filter.createContact.handler
);

// nodemail to send email

router.post(
  "/emailcontact",
  // passport.authenticate(["jwt"], { session: false }),
  api4Filter.emailContact.handler
);

// PUT method
router.put(
  "/updatestatus/id=:userId&status=:status",
  passport.authenticate(["jwt"], { session: false }),
  api4Filter.statusContact.handler
);

// router.put("/update-filter-type",
//   // passport.authenticate(["jwt"], { session: false }),
// api4Filter.updateFilterType.handler);

// router.put("/update-filter",
//   // passport.authenticate(["jwt"], { session: false }),
// api4Filter.updateFilter.handler);

// router.put("/delete-filter",
//   // passport.authenticate(["jwt"], { session: false }),
// api4Filter.deleteFilter.handler);

// // DELETE method
router.delete(
  "/deletecontact/id=:userId",
  passport.authenticate(["jwt"], { session: false }),
  api4Filter.deleteContact.handler
);

module.exports = exports = router;
