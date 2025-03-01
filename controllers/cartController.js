const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");

const calcTotalPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.priceAfterDiscount = undefined;
  return totalPrice;
};

// @desc Add product to cart
// @route POST /api/v1/carts
// @access Protect/user
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;

  const product = await Product.findById(productId);

  // Get cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // Create cart for logged user with product
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [
        {
          product: productId,
          color,
          price: product.price,
        },
      ],
    });
  } else {
    // If product exists in cart, update product quantity
    const productIndex = cart.cartItems.findIndex((item) => {
      return item.product.toString() === productId && item.color === color;
    });

    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      //If product not exists in cart, push product to cart items
      cart.cartItems.push({ product: productId, color, price: product.price });
    }
  }
  // Calculate total cart price
  calcTotalPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Product added to cart successfully",
    data: cart,
  });
});

// @desc Get logged user cart
// @route GET/api/v1/carts
// @access Protect/user

exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(
      new ApiError(`There is no cart for this user id: ${req.user._id}`),
      404
    );
  }
  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Remove specific logged user cart items
// @route DELETE/api/v1/carts/:itemId
// @access Protect/user
exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );
  calcTotalPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Remove logged user cart
// @route DELETE/api/v1/carts/
// @access Protect/user
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});

// @desc Update logged user cart item quantity
// @route PUT/api/v1/carts/:itemId
// @access Protect/user
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError(`There is no cart for user ${req.user._id}`, 404));
  }

  const itemIndex = cart.cartItems.findIndex((item) => {
    return item._id.toString() === req.params.itemId;
  });

  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      new ApiError(`There is no item for this id: ${req.params.itemId}`, 404)
    );
  }
  calcTotalPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
// @desc Apply coupon on logged user cart
// @route PUT /api/v1/carts/applyCoupon
// @access Protect/user
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1) Get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });
  if (!coupon) {
    return next(new ApiError(`Coupon is invalid or expired`, 404));
  }
  // 2) Get logged user cart to get total cart price
  const cart = await Cart.findOne({ user: req.user._id });
  const totalPrice = cart.totalCartPrice;

  // 3) Calculate price after priceAfterDiscount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);

  cart.priceAfterDiscount = totalPriceAfterDiscount;

  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
