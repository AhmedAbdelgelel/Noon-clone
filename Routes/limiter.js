const rateLimit = require("express-rate-limit");

// Limit each IP to 5 requests per 15 minutes for sensitive routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message:
    "Too many authentication attempts from this IP, please try again after 15 minutes",
});

module.exports = authLimiter;
