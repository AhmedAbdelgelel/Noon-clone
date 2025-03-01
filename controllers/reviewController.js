const Review = require("../models/reviewModel");
const factory = require("./handlersFactory");

exports.setProductIdAndUserToBody = (req, res, next) => {
  // Nested route (Create)
  if (!req.body.product) {
    req.body.product = req.params.productId;
  }
  if (!req.body.user) {
    req.body.user = req.user._id;
  }
  next();
};
// Nested Route: Filter products by product ID
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) {
    filterObject = { product: req.params.productId };
  }
  req.filterObj = filterObject;
  next();
};

// @desc  Get list of reviews
// @route GET /api/v1/reviews
// @access Public
exports.getReviews = factory.getAll(Review);

// @desc  Get specific review by id
// @route GET /api/v1/reviews/:id
// @access Public
exports.getReview = factory.getOne(Review);

// @desc  Create review
// @route POST /api/v1/reviews
// @access Private/Protect/User
exports.createReview = factory.createOne(Review);

// @desc   Update specific review
// @route  PUT /api/v1/reviews/:id
// @access Private/Protect/User
exports.updateReview = factory.updateOne(Review);

// @desc   Delete specific review
// @route  DELETE /api/v1/reviews/:id
// @access Private/Protect/User-Admin-Manager
exports.deleteReview = factory.deleteOne(Review);
