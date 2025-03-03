const express = require("express");
const { createPerson } = require("../controllers/personController");

const router = express.Router();

router.post("/", createPerson);

module.exports = router;
