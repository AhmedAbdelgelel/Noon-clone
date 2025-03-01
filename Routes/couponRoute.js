const express = require("express");

const {
  getCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");

const { protect, allowedTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect, allowedTo("admin", "manager"));

router.route("/").get(getCoupons).post(createCoupon);

router.route("/:id").get(getCoupon).put(updateCoupon).delete(deleteCoupon);

module.exports = router;
