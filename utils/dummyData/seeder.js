/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable node/no-unsupported-features/es-syntax */
const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");
require("colors");
const slugify = require("slugify");
const Product = require("../../models/productModel");
const dbConnection = require("../../config/database");

dotenv.config({ path: path.resolve(__dirname, "..", "..", "config.env") });

dbConnection();

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, "products.json"))
);

// Add slugs to products
const productsWithSlugs = products.map((product) => ({
  ...product,
  slug: slugify(product.title, { lower: true }),
}));

const insertData = async () => {
  try {
    await Product.create(productsWithSlugs);
    console.log("Data inserted".green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log("Data destroyed".red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === "-i") {
  insertData();
} else if (process.argv[2] === "-d") {
  destroyData();
}
