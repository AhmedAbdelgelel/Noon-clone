const ApiError = require("../utils/apiError");
const notFound = (req, res, next) => {
  return next(new ApiError("Page not found", 404));
};

module.exports = notFound;
