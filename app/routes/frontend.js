const express = require("express");
const router = express.Router();

const web = require("app/web/web.js");



router.get("/admin", web.example.bind(web));


module.exports = router;