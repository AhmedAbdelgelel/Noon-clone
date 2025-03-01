const express = require("express");

const { protect, allowedTo } = require("../controllers/authController");

const {
  addProductToWishList,
  removeProductFromWishList,
  getMyWishList,
} = require("../controllers/wishList");

const router = express.Router();

router.use(protect, allowedTo("user"));

router.route("/").post(addProductToWishList).get(getMyWishList);

router.delete("/:productId", removeProductFromWishList);

module.exports = router;
