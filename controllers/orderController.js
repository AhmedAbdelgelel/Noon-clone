const stripe = require("stripe")(process.env.STRIPE_SECRET);
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// @desc  create cash order
// @route  POST /api/v1/orders/cartId
// @access Protected/User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // app settings (admin only)
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);

  if (!cart) {
    return next(
      new ApiError(`There's no cart with this id:${req.params.cartId}`, 404)
    );
  }

  // 2) Get order price after discount if there is any coupon applied
  const cartPrice = cart.priceAfterDiscount
    ? cart.priceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create order with default paymentMethodType "cash"
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: {
          _id: item.product,
        },
        update: {
          $inc: {
            quantity: -item.quantity,
            sold: +item.quantity,
          },
        },
      },
    }));
    await Product.bulkWrite(bulkOption);

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);
  }
  res.status(201).json({
    status: "success",
    data: order,
  });
});

exports.filterOrdersForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") {
    req.filterObj = { user: req.user._id };
  }
  next();
});

// @desc  Get all orders
// @route  GET /api/v1/orders/
// @access Protected/User-Admin-Manager
exports.getAllOrders = factory.getAll(Order);

// @desc  Get specific order
// @route  GET /api/v1/orders/
// @access Protected/User-Admin-Manager
exports.getSpecificOrder = factory.getOne(Order);

// @desc  Update order paid status to paid
// @route  GET /api/v1/orders/:id/pay
// @access Protected/Admin-Manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(`There's no order for this id: ${req.params.id}`, 404)
    );
  }
  // update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

// @desc  Update order delivered status to delivered
// @route  GET /api/v1/orders/:id/deliver
// @access Protected/Admin-Manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(`There's no order for this id: ${req.params.id}`, 404)
    );
  }
  // update order to delivered
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});
// @desc Get checkout session from stripe and send it as response
// @route GET /api/v1/orders/checkout-session
// @access Protected/User
exports.checkOutSession = asyncHandler(async (req, res, next) => {
  console.log("Checkout session endpoint called");

  // App settings
  const taxPrice = 0;
  const shippingPrice = 0;
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no cart with id: ${req.params.cartId}`, 404)
    );
  }
  // 2) Get order price after discount if there is any coupon applied
  const cartPrice = cart.priceAfterDiscount
    ? cart.priceAfterDiscount
    : cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: req.user.name,
          },
          unit_amount: totalOrderPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });
  // 4) Send session as response
  res.status(200).json({
    status: "success",
    session,
  });
});
