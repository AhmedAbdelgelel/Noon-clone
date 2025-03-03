const { check } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  validatorMiddleware,
];

exports.signUpValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name required")
    .isLength({ min: 3 })
    .withMessage("Too short user name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        return Promise.reject(new Error("E-mail is already in use"));
      }
    }),
  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password confirmation is not correct");
      }
      return true;
    }),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required"),

  validatorMiddleware,
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address"),
  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  validatorMiddleware,
];
