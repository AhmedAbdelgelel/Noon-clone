const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc  Add address to user addresses list
// @route POST /api/v1/addresses
// @access Protect/user
exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    // $addToSet: add address object to addresses array
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "Address added successfully",
    data: user.addresses,
  });
});

// @desc  Remove address from addresses
// @route Delete /api/v1/addresses/:addressId
// @access Protect/user
exports.removeAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    // $pull: remove address object from user addresses array
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Address removed successfully",
    data: user.addresses,
  });
});

// @desc  Get user addresses
// @route GET /api/v1/addresses/:addressId
// @access Protect/user
exports.getAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("addresses");
  res.status(200).json({
    status: "success",
    result: user.addresses.length,
    data: user.addresses,
  });
});
