const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const generateToken = (payload) => {
  return jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
};
const generateCSRFToken = () => crypto.randomBytes(32).toString("hex");

module.exports = { generateToken, generateCSRFToken };
