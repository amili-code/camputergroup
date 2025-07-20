const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { syncDatabase } = require('./config/syncDatabase');
require('dotenv').config();
const server = http.createServer(app);

function setupExpress() {
    server.listen(process.env.PORT, () => console.log(`listening on port ${process.env.PORT}`));
}

function setConfig() {
    app.use(express.static("public"));
    app.set("views", path.resolve("./app/templates"));
    app.set("view engine", "ejs");
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cors());
}

function serRouters() {
    app.use(require("app/routes/routes.js"));
}



module.exports = class Application {
    constructor() {
        try {
            setupExpress();
            setConfig();
            serRouters();
        } catch (error) {
            console.log(error);
        }
    }
}