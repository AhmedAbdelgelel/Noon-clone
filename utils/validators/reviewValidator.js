const { check, body } = require("express-validator");
const Review = require("../../models/reviewModel");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid review id format"),
  validatorMiddleware,
];

exports.createReviewValidator = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("Ratings value required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Ratings value must be between 1 to 5"),
  check("user").isMongoId().withMessage("Invalid review id format"),
  check("product")
    .isMongoId()
    .withMessage("Invalid review id format")
    .custom(async (val, { req }) => {
      // Check if logged user create review before
      const review = await Review.findOne({
        user: req.user._id,
        product: req.body.product,
      });
      if (review) {
        return Promise.reject(new Error("You already created a review before"));
      }
    }),

  validatorMiddleware,
];
exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid review id format")
    .custom(async (val, { req }) => {
      // Check review ownership before update
      const review = await Review.findById(val);
      if (!review) {
        return Promise.reject(new Error(`There is no review with id:${val}`));
      }
      if (review.user._id.toString() !== req.user._id.toString()) {
        return Promise.reject(
          new Error("You are not allowed to perform this action")
        );
      }
    }),
  validatorMiddleware,
];
exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid review id format")
    .custom(async (val, { req }) => {
      // Check review ownership before delete
      const review = await Review.findById(val);
      if (req.user.role == "user") {
        if (!review) {
          return Promise.reject(new Error(`There is no review with id:${val}`));
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error("You are not allowed to perform this action")
          );
        }
      }
      return true;
    }),
  validatorMiddleware,
];
