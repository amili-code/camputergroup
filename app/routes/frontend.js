
const express = require("express");
const router = express.Router();

const web = require("app/web/web.js");



router.get("/admin", web.example.bind(web));
router.get("/", web.landing.bind(web));
router.get("/courses", web.courses.bind(web));
router.get("/courses/:id", web.coursesOne.bind(web));
router.get("/news", web.news.bind(web));
router.get("/news/:id", web.newsOne.bind(web));
router.get("/teacher/:id", web.teacherOne.bind(web));
router.get("/tranning", web.tranning.bind(web));
router.get("/community", web.community.bind(web));
router.get("/teachers", web.teachers.bind(web));
router.get("/aboutUs", web.aboutUs.bind(web));
router.get("/finalStudent", web.finalStudent.bind(web));
router.get("/groupmanager", web.groupmanager.bind(web));

router.get("/student", web.student.bind(web));
router.get("/teacher", web.teacher.bind(web));

router.get("/login", web.login.bind(web));

module.exports = router;