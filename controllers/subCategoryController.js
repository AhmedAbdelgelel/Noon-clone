const SubCategory = require("../models/subCategoryModel");
const subCategoryModel = require("../models/subCategoryModel");
const factory = require("./handlersFactory");

exports.setCategoryIdToBody = (req, res, next) => {
  // Nested route
  if (!req.body.category) {
    req.body.category = req.params.categoryId;
  }
  next();
};

// Nested Route: Filter subcategories by category ID
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) {
    filterObject = { category: req.params.categoryId };
  }
  req.filterObj = filterObject;
  next();
};

// @desc  Create subCategory
// @route POST /api/v1/subCategories
// @access Private/Admin-Manager
exports.createSubCategory = factory.createOne(subCategoryModel);

// @desc  Get list of subCategories
// @route GET /api/v1/subCategories
// @access Public
exports.getSubCategories = factory.getAll(subCategoryModel);

// @desc  Get specific subCategory by id
// @route GET /api/v1/subcategories/:id
// @access Public
exports.getSubCategory = factory.getOne(subCategoryModel);

// @desc   Update specific subCategory
// @route  PUT /api/v1/subCategories
// @access Private/Admin-Manager
exports.updateSubCategory = factory.updateOne(subCategoryModel);

// @desc   Delete specific subCategory
// @route  DELETE /api/v1/subCategories
// @access Private/Admin
exports.deleteSubCategory = factory.deleteOne(SubCategory);
