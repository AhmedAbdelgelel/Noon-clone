const express = require("express");

const {
  signUpValidator,
  loginValidator,
  // changeUserPasswordValidator,
} = require("../utils/validators/authValidator");

const {
  signUp,
  login,
  forgotPassword,
  verifyPasswordResetCode,
  resetPassword,
} = require("../controllers/authController");
const router = express.Router();

router.post("/signup", signUpValidator, signUp);
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyResetCode", verifyPasswordResetCode);
router.put("/resetPassword", resetPassword);

module.exports = router;
