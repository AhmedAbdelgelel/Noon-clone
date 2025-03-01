const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc  Add product to wishlist
// @route POST /api/v1/wishlist
// @access Protect/user
exports.addProductToWishList = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    // $addToSet: add productId to wishlist if productId not exists
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "Product added successfully to your wishlist",
    data: user.wishlist,
  });
});

// @desc  Remove product from wishlist
// @route Delete /api/v1/wishlist/:productId
// @access Protect/user
exports.removeProductFromWishList = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    // $pull: remove productId from wishlist if productId exists
    {
      $pull: { wishlist: req.params.productId },
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "Product added successfully to your wishlist",
    data: user.wishlist,
  });
});

// @desc  Get user wishlist
// @route GET /api/v1/wishlist/:productId
// @access Protect/user
exports.getMyWishList = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.status(200).json({
    status: "success",
    result: user.wishlist.length,
    data: user.wishlist,
  });
});
