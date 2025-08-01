const express = require("express");
const router = express.Router();

const backEnd = require("app/routes/backend.js");
const front = require("app/routes/frontend.js");


router.use("/", front);
router.use("/api", backEnd);
router.use((req, res) => {
    res.status(404).render('404');
});

module.exports = router;
