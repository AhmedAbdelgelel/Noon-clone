const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const express = require("express");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

dotenv.config({ path: "config.env" });
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");
const mountRoutes = require("./Routes/mountRoutes");
// Database connection
dbConnection();

// express app
const app = express();

// Enable CORS - Allow to access from any website
app.use(cors());
app.options("*", cors());

// compress all responses
app.use(compression());

// Middlewares
app.use(express.json({ limit: "20kb" }));
// Sanitize data
app.use(mongoSanitize());
app.use((req, res, next) => {
  console.log("After Mongo Sanitize:", {
    body: req.body,
    query: req.query,
    params: req.params,
  });
  next();
});

// Data sanitization against XSS
app.use(xss());
app.use((req, res, next) => {
  console.log("After XSS Clean:", {
    body: req.body,
    query: req.query,
    params: req.params,
  });
  next();
});

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "price",
      "sold",
      "quantity",
      "ratingsAverage",
      "ratingsQuantity",
    ],
  })
);
// Serving static files
app.use(express.static(path.join(__dirname, "uploads")));

// Mount swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routes
mountRoutes(app);

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route : ${req.originalUrl}`, 400));
});

// Global error handling middleware
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running at port:${PORT}`);
});

// Handling rejections outside express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shuting down....`);
    process.exit(1);
  });
});
