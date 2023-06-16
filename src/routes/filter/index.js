const express = require("express");
const router = express.Router();
const api4Filter = require("../../api/filter/index");
const { validate } = require("../../middlewares");
const passport = require("passport");

// GET Method
router.get(
  "/get-filter",
  // passport.authenticate(["jwt"], { session: false }),
  api4Filter.getFilter.handler
);

router.get(
  "/get-filter-user",
  passport.authenticate(["jwt"], { session: false }),
  api4Filter.getFilterUser.handler
);

router.get(
  "/get-user-selected-filters",
  passport.authenticate(["jwt"], { session: false }),
  api4Filter.getFilterUserSelect.handler
);

router.get(
  "/get-filter-type",
  // passport.authenticate(["jwt"], { session: false }),
  api4Filter.getFilterType.handler
);

router.get(
  "/",
  // passport.authenticate(["jwt"], { session: false }),
  api4Filter.mostUsedFilter.handler
);

// POST Method
router.post(
  "/create-filter",
  passport.authenticate(["jwt"], { session: false }),
  api4Filter.createFilter.handler
);

router.post(
  "/create-filter-type",
  // passport.authenticate(["jwt"], { session: false }),
  api4Filter.createFilterType.handler
);

// PUT method
router.put(
  "/add-filter-option",
  // passport.authenticate(["jwt"], { session: false }),
  api4Filter.addFilterOption.handler
);

router.put(
  "/update-filter-type",
  // passport.authenticate(["jwt"], { session: false }),
  api4Filter.updateFilterType.handler
);

router.put(
  "/update-filter",
  passport.authenticate(["jwt"], { session: false }),
  api4Filter.updateFilter.handler
);

router.put(
  "/delete-filter",
  // passport.authenticate(["jwt"], { session: false }),
  api4Filter.deleteFilter.handler
);

router.put(
  "/display-profile-filter/single=:single",
  passport.authenticate(["jwt"], { session: false }),
  api4Filter.displayProfile.handler
);

router.post(
  "/update-user-select-filter",
  passport.authenticate(["jwt"], { session: false }),
  api4Filter.updteUserFilter.handler
);

// DELETE method
router.delete(
  "/delete-filter-type",
  // passport.authenticate(["jwt"], { session: false }),
  api4Filter.deleteFilterType.handler
);

module.exports = exports = router;
