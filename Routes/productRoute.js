const express = require("express");
const reviewsRoute = require("./reviewRoute");
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidation");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
} = require("../controllers/productController");
const { protect, allowedTo } = require("../controllers/authController");

const router = express.Router();

// POST  /products/dskjdksdkjshdksdl/reviews
// GET  /products/dskjdksdkjshdksdl/reviews
// GET  /products/dskjdksdkjshdksdl/reviews/dlksjdksjd
router.use("/:productId/reviews", reviewsRoute);

router
  .route("/")
  .get(getProducts)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    createProductValidator,
    createProduct
  );
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    protect,
    allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(protect, allowedTo("admin"), deleteProductValidator, deleteProduct);
module.exports = router;
