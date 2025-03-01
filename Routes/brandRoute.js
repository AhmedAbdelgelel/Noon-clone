const express = require("express");

const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require("../utils/validators/brandValidation");
const {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  resizeImage,
  uploadBrandImage,
} = require("../controllers/brandController");
const { protect, allowedTo } = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(getBrands)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadBrandImage,
    resizeImage,
    createBrandValidator,
    createBrand
  );
router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(
    protect,
    allowedTo("admin", "manager"),
    uploadBrandImage,
    resizeImage,
    updateBrandValidator,
    updateBrand
  )
  .delete(protect, allowedTo("admin"), deleteBrandValidator, deleteBrand);
module.exports = router;
