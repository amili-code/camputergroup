const express = require("express");
const router = express.Router();

const backEnd = require("app/routes/backend.js");
const front = require("app/routes/frontend.js");


router.use("/", front);
router.use("/api", backEnd);

module.exports = router;
