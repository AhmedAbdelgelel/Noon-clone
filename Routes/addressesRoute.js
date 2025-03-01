const express = require("express");

const { protect, allowedTo } = require("../controllers/authController");

const {
  addAddress,
  getAddresses,
  removeAddress,
} = require("../controllers/addressesController");

const router = express.Router();

router.use(protect, allowedTo("user"));

router.route("/").post(addAddress).get(getAddresses);

router.delete("/:addressId", removeAddress);

module.exports = router;
