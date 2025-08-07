const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();
const server = http.createServer(app);
const { models } = require('./config/models');
const jalaali = require('jalaali-js');
const cron = require('node-cron');

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


/**
 * Parse a Persian date string (yyyy/M/d, yyyy/MM/dd, etc.) to a JS Date object
 * @param {string} dateStr
 * @returns {Date|null}
 */
function parseJalaliDate(dateStr) {
    if (!dateStr) return null;
    const match = dateStr.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (!match) return null;
    const [_, jy, jm, jd] = match;
    const { gy, gm, gd } = jalaali.toGregorian(parseInt(jy), parseInt(jm), parseInt(jd));
    return new Date(gy, gm - 1, gd, 23, 59, 59, 999); // End of day
}


async function checkAndExpireCourses() {
    const { Course } = models;
    const today = new Date();
    const courses = await Course.findAll({ where: { isAvailable: true } });
    for (const course of courses) {
        const expireDate = parseJalaliDate(course.endDate);
        if (expireDate && expireDate < today) {
            course.isAvailable = false;
            course.unavailabilityReason = 'اتمام تاریخ دوره';
            await course.save();
        }
    }
}

// اجرای خودکار هر روز ساعت ۲ بامداد
cron.schedule('0 2 * * *', () => {
    checkAndExpireCourses()
        .then(() => console.log('بررسی انقضای دوره‌ها با موفقیت انجام شد.'))
        .catch(err => console.error('خطا در بررسی انقضای دوره‌ها:', err));
});


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