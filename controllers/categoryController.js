const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const Category = require("../models/categoryModel");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

exports.uploadCategoryImage = uploadSingleImage("image");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .png({ quality: 90 })
      .toFile(`uploads/categories/${filename}`);

    req.body.image = filename;
  }

  next();
});

// @desc  Get list of categories
// @route GET /api/v1/categories
// @access Public
exports.getCategories = factory.getAll(Category);

// @desc   Get specific category by id
// @route GET /api/v1/categories/:id
// @access Public
exports.getCategory = factory.getOne(Category);

// @desc   Create Category
// @route  POST /api/v1/categories
// @access Private/Admin-Manager
exports.createCategory = factory.createOne(Category);

// @desc   Update specific category
// @route  PUT /api/v1/categories
// @access Private/Admin-Manager
exports.updateCategory = factory.updateOne(Category);

// @desc   Delete specific category
// @route  DELETE /api/v1/categories
// @access Private/Admin
exports.deleteCategory = factory.deleteOne(Category);
