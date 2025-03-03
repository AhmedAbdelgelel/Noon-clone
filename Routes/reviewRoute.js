const express = require("express");
const {
  getReviewValidator,
  createReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../utils/validators/reviewValidator");
const {
  getReview,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  createFilterObj,
  setProductIdAndUserToBody,
} = require("../controllers/reviewController");
const { protect, allowedTo } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(createFilterObj, getReviews)
  .post(
    protect,
    allowedTo("user"),
    setProductIdAndUserToBody,
    createReviewValidator,
    createReview
  );
router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(protect, allowedTo("user"), updateReviewValidator, updateReview)
  .delete(
    protect,
    allowedTo("admin", "user", "manager"),
    deleteReviewValidator,
    deleteReview
  );
module.exports = router;
