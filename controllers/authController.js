const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { generateToken, generateCSRFToken } = require("../utils/createToken");
const sanitizeData = require("../utils/sanitizeData");
// @desc   Signup
// @route  GET /api/v1/auth/signup
// @access Public
exports.signUp = asyncHandler(async (req, res, next) => {
  // 1- Create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  // 2- Generate JWT
  const token = generateToken(user._id);

  // 3- Generate CSRF token
  const csrfToken = generateCSRFToken();

  // 4- Set CSRF token in cookie
  res.cookie("XSRF-TOKEN", csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });

  res.status(201).json({
    data: sanitizeData(user),
    token,
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  // 1- Find user
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  // 2- Check password
  const isCorrectPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isCorrectPassword) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  // 3- generate token
  const token = generateToken(user._id);

  // 4- Generate CSRF token
  const csrfToken = generateCSRFToken();

  // 5- Set CSRF token in cookie
  res.cookie("XSRF-TOKEN", csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });

  res.status(200).json({
    data: sanitizeData(user),
    token,
  });
});

exports.protect = asyncHandler(async (req, res, next) => {
  // 1- check if token exists, if exists get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not login, please login to get access this route",
        401
      )
    );
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError("Please log in again.", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(
        new ApiError("Your token has expired. Please log in again.", 401)
      );
    }

    return next(new ApiError("Failed to authenticate token.", 401));
  }
  // 3- check if user exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        "The user that belong to this token does no longer exists",
        401
      )
    );
  }
  if (req.path === "/changeMyPassword" || req.path === "/recoverMe") {
    req.user = currentUser;
    return next();
  }

  if (!currentUser.active) {
    return next(new ApiError("You must activate your account", 404));
  }

  if (currentUser.passwordChangedAt) {
    const passwordChangedTimeStamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passwordChangedTimeStamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently changed their password. Please login again.",
          401
        )
      );
    }
  }

  req.user = currentUser;
  next();
});
// @desc Authorization (User Permissions)
// ["admin","manager"]
exports.allowedTo = (...roles) =>
  // 1) access roles
  // 2) access registered user (req.user.role)
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError("You are not allowed access this route", 403));
    }
    next();
  });

// @desc   Forgot password
// @route  Post /api/v1/auth/forgotPassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with this email ${req.body.email}`)
    );
  }
  // 2) If user exists, Generate hashed reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();

  // 3) Send the reset code via email
  const message = `Hello ${user.name},\n\nYou have requested to reset your password.\nPlease use the following code to reset your password:\n\nReset Code: ${resetCode}\n\nThis code is valid for 10 minutes.\nIf you did not request a password reset, please ignore this email or contact support.\n\nBest regards,\nGLGL`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(new ApiError("There is an error in sending email", 500));
  }

  res.status(200).json({
    status: "success",
    message: "reset code sent to email successfully",
  });
});

// @desc   Verify password reset code
// @route  Post /api/v1/auth/verifyResetCode
// @access Public
exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");
  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset code invalid of expired", 401));
  }
  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();
  res.status(200).json({
    status: "Successful verification",
  });
});

// @desc   password reset
// @route  Post /api/v1/auth/resetPassword
// @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with email:${req.body.email}`, 404)
    );
  }
  // 2) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3) if everything ok generate new token

  const token = generateToken(user._id);
  res.status(200).json({
    token,
  });
});
