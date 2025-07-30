const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
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
    
    // Session configuration
    app.use(session({
        secret: process.env.SESSION_SECRET || '1234567890',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    }));
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