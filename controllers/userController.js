const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const User = require("../models/userModel");
const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");
const generateToken = require("../utils/createToken");

exports.uploadUserImage = uploadSingleImage("profileImg");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .png({ quality: 90 })
      .toFile(`uploads/users/${filename}`);

    // Save image into our db
    req.body.profileImg = filename;
  }

  next();
});

// @desc  Get list of users
// @route GET /api/v1/users
// @access Private/Admin
exports.getUsers = factory.getAll(User);

// @desc  Get specific User by id
// @route GET /api/v1/Users/:id
// @access Private/Admin
exports.getUser = factory.getOne(User);

// @desc  Create user
// @route POST /api/v1/users
// @access Private/Admin
exports.createUser = factory.createOne(User);

// @desc   Update specific user
// @route  PUT /api/v1/users/:id
// @access Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,

    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      role: req.body.role,
      profileImg: req.body.profileImg,
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new ApiError(`No document found for this id: ${id}`, 404));
  }
  res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new ApiError(`No document found for this id: ${id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc   Delete specific user
// @route  DELETE /api/v1/users/:id
// @access Private/Admin
exports.deleteUser = factory.deleteOne(User);

// @desc  Get logged user data
// @route GET /api/v1/Users/getMe
// @access Private/Protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc  Update logged user password
// @route PUT /api/v1/Users/updateMyPassword
// @access Private/Protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1) Update user password based on user payload (req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );
  // 2) Generate token
  const token = generateToken(user._id);
  res.status(200).json({
    data: user,
    token,
  });
});
// @desc  Update logged user data without password or role
// @route PUT /api/v1/Users/updateMe
// @access Private/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );
  res.status(200).json({
    data: updatedUser,
  });
});

// @desc  Deactivate logged user
// @route DELETE /api/v1/Users/deleteMe
// @access Private/Protect
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(200).json({
    status: "success",
    message: "Your account has been deleted successfully",
  });
});
// @desc  Deactivate logged user
// @route POST /api/v1/Users/deleteMe
// @access Private/Protect
exports.recoverLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: true });
  res.status(200).json({
    status: "success",
    message: "Your account has been activated successfully",
  });
});
