const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const factory = require("./handlersFactory");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");

exports.uploadProductImages = uploadMixOfImages([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  //1) Image processing for imageCover
  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .toFile(`uploads/products/${imageCoverFileName}`);
    // Save image into our db
    req.body.imageCover = imageCoverFileName;
  }

  //2) Image processing for images
  if (req.files.images) {
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .toFile(`uploads/products/${imageName}`);
        req.body.images.push(imageName);
      })
    );
  }
  next();
});
// @desc   Get list of products
// @route GET /api/v1/products
// @access Public
exports.getProducts = factory.getAll(Product, "Product");

// @desc   Get specific product by id
// @route GET /api/v1/products/:id
// @access Public
exports.getProduct = factory.getOne(Product, "reviews");

// @desc   Create Product
// @route POST /api/v1/products
// @access Private/Admin-Manager
exports.createProduct = factory.createOne(Product);

// @desc   Update specific product
// @route  PUT /api/v1/products/:id
// @access Private/Admin-Manager
exports.updateProduct = factory.updateOne(Product);

// @desc   Delete specific product
// @route  DELETE /api/v1/products/:id
// @access Private/Admin
exports.deleteProduct = factory.deleteOne(Product);
