const express = require("express");

const {
  createCashOrder,
  getAllOrders,
  getSpecificOrder,
  filterOrdersForLoggedUser,
  updateOrderToDelivered,
  updateOrderToPaid,
  checkOutSession,
} = require("../controllers/orderController");

const { protect, allowedTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.get("/checkout-session/:cartId", allowedTo("user"), checkOutSession);

router.route("/:cartId").post(allowedTo("user"), createCashOrder);

router.get(
  "/",
  allowedTo("user", "admin", "manager"),
  filterOrdersForLoggedUser,
  getAllOrders
);
router.get("/:id", getSpecificOrder);

router.put(
  "/:id/deliver",
  allowedTo("admin", "manager"),
  updateOrderToDelivered
);
router.put("/:id/pay", allowedTo("admin", "manager"), updateOrderToPaid);

module.exports = router;
