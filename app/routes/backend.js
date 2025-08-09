const express = require("express");
const router = express.Router();
const multer = require('multer');
const { models } = require('../config/models');
const path = require('path');
const fs = require('fs');
// تنظیمات آپلود تصویر پرسنلی استاد
const teacherImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/pic/teachers");
    },
    filename: function (req, file, cb) {
        // ایجاد نام منحصر به فرد برای فایل
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'teacher-' + uniqueSuffix + '-' + file.originalname);
    }
});

const teacherImageUpload = multer({ 
    storage: teacherImageStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // حداکثر 2 مگابایت
        files: 1 // حداکثر 1 فایل
    },
    fileFilter: (req, file, cb) => {
        // بررسی نوع فایل
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('فقط فایل‌های تصویری مجاز هستند'), false);
        }
    }
});


// تنظیمات آپلود تصویر دوره
const courseImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/pic/course");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'course-' + uniqueSuffix + '-' + file.originalname);
    }
});
const courseImageUpload = multer({
    storage: courseImageStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // حداکثر 2 مگابایت
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('فقط فایل‌های تصویری مجاز هستند'), false);
        }
    }
});


// تنظیمات آپلود فایل آموزشی
const trainingFileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/files");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'training-' + uniqueSuffix + '-' + file.originalname);
    }
});
const trainingFileUpload = multer({
    storage: trainingFileStorage,
    limits: {
        fileSize: 100 * 1024 * 1024, // حداکثر 100 مگابایت
        files: 1
    },
    fileFilter: (req, file, cb) => {
        // همه فرمت‌ها مجاز است
        cb(null, true);
    }
});


// تنظیمات آپلود تصویر خبر/اطلاعیه
const newsImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/pic/news");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'news-' + uniqueSuffix + '-' + file.originalname);
    }
});
const newsImageUpload = multer({
    storage: newsImageStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // حداکثر 2 مگابایت
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('فقط فایل‌های تصویری مجاز هستند'), false);
        }
    }
});




// تنظیمات آپلود عکس گالری تنظیمات
const settingsImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/pic/settings");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'gallery-' + uniqueSuffix + '-' + file.originalname);
    }
});
const settingsImageUpload = multer({
    storage: settingsImageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // حداکثر 5 مگابایت
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('فقط فایل‌های تصویری مجاز هستند'), false);
        }
    }
});




// تنظیمات آپلود بخش‌های درباره ما
const aboutUsImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/pic/about");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'about-' + uniqueSuffix + '-' + file.originalname);
    }
});

const aboutUsFileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/files/about");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'about-' + uniqueSuffix + '-' + file.originalname);
    }
});

const aboutUsImageUpload = multer({
    storage: aboutUsImageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // حداکثر 5 مگابایت
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('فقط فایل‌های تصویری مجاز هستند'), false);
        }
    }
});

const aboutUsFileUpload = multer({
    storage: aboutUsFileStorage,
    limits: {
        fileSize: 50 * 1024 * 1024, // حداکثر 50 مگابایت
        files: 1
    },
    fileFilter: (req, file, cb) => {
        // همه فرمت‌ها مجاز است
        cb(null, true);
    }
});

const uploadAbout = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, "public/pic/about");
            } else {
                cb(null, "public/files/about");
            }
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'about-' + uniqueSuffix + '-' + file.originalname);
        }
    }),
    limits: {
        fileSize: 50 * 1024 * 1024, // حداکثر 50 مگابایت
        files: 1
    }
});

// تنظیمات آپلود بخش‌های درباره ما سایت
const siteAboutUsImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/pic/settings");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'site-about-' + uniqueSuffix + '-' + file.originalname);
    }
});

const siteAboutUsFileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/files/settings");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'site-about-' + uniqueSuffix + '-' + file.originalname);
    }
});

const uploadSiteAbout = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, "public/pic/settings");
            } else {
                cb(null, "public/files/settings");
            }
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'site-about-' + uniqueSuffix + '-' + file.originalname);
        }
    }),
    limits: {
        fileSize: 50 * 1024 * 1024, // حداکثر 50 مگابایت
        files: 1
    }
});

// تنظیمات آپلود عکس پروفایل دانشجو
const studentImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/pic/students");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'student-' + uniqueSuffix + '-' + file.originalname);
    }
});

const studentImageUpload = multer({
    storage: studentImageStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // حداکثر 2 مگابایت
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('فقط فایل‌های تصویری مجاز هستند'), false);
        }
    }
});

// تنظیمات آپلود محتوای وبلاگ اساتید
const teacherMetaStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, "public/pic/teachers");
        } else {
            cb(null, "public/files/teachers");
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'teacher-meta-' + uniqueSuffix + '-' + file.originalname);
    }
});

const uploadTeacherMeta = multer({
    storage: teacherMetaStorage,
    limits: {
        fileSize: 50 * 1024 * 1024, // حداکثر 50 مگابایت
        files: 1
    }
});

// ==================== ADMIN ROUTES ====================
const adminController = require("../api/admin");
router.get('/admins', isMainAdmin,adminController.getAllAdmins.bind(adminController));
router.get('/admins/:id', isMainAdmin,adminController.getAdminById.bind(adminController));
router.post('/admins', isMainAdmin, adminController.createAdmin.bind(adminController));
router.put('/admins/:id', isMainAdmin,adminController.updateAdmin.bind(adminController));
router.delete('/admins/:id', isMainAdmin,adminController.deleteAdmin.bind(adminController));
router.get('/group-admins',  adminController.getGroupAdmins.bind(adminController));








// ==================== AUTH ROUTES ====================
const authController = require("../api/auth");

// Student Login
router.post('/auth/student/login', authController.studentLogin.bind(authController));

// Teacher Login
router.post('/auth/teacher/login', authController.teacherLogin.bind(authController));

// Logout
router.post('/auth/logout', authController.logout.bind(authController));

// Get Current User
router.get('/auth/me', authController.getCurrentUser.bind(authController));

// Middleware routes for checking authentication
router.get('/auth/check', authController.isAuthenticated.bind(authController));
router.get('/auth/check/teacher', authController.isTeacher.bind(authController));
router.get('/auth/check/student', authController.isStudent.bind(authController));

// Admin Login Route
router.post('/admin/login', authController.adminLogin.bind(authController));

// Admin Logout Route
router.post('/admin/logout', authController.adminLogout.bind(authController));




// ==================== STUDENT ROUTES ====================
const studentController = require("../api/student");

// CREATE - ایجاد دانشجوی جدید
router.post('/student', isAdmin, studentImageUpload.single('profileImage'), (req, res, next) => {
    if (req.file) {
        req.body.profileImage = `/pic/students/${req.file.filename}`;
    }
    next();
}, studentController.createStudent.bind(studentController));

// READ - دریافت دانشجویان
router.get('/students', isAdmin, studentController.getAllStudents.bind(studentController));
router.get('/student/:id', isAdmin, studentController.getStudentById.bind(studentController));
router.get('/students/graduated', studentController.getGraduatedStudents.bind(studentController));
router.get('/students/active', isAdmin, studentController.getActiveStudents.bind(studentController));

// UPDATE - بروزرسانی دانشجو
router.put('/student/:id', isAdmin, studentImageUpload.single('profileImage'), (req, res, next) => {
    if (req.file) {
        req.body.profileImage = `/pic/students/${req.file.filename}`;
    }
    next();
}, studentController.updateStudent.bind(studentController));
router.patch('/student/:id/toggle-graduation', isAdmin, studentController.toggleGraduationStatus.bind(studentController));

// DELETE - حذف دانشجو
router.delete('/student/:id', isAdmin, studentController.deleteStudent.bind(studentController));

// SEARCH - جستجو در دانشجویان
router.get('/students/search', isAdmin, studentController.searchStudents.bind(studentController));

// ==================== STUDENT META ROUTES ====================
const studentMetaController = require("../api/studentMeta");

// CREATE - ایجاد اطلاعات متا برای دانشجو
router.post('/student-meta', isUserLoggedIn, studentMetaController.createStudentMeta.bind(studentMetaController));

// READ - دریافت تمام اطلاعات متا
router.get('/student-meta', studentMetaController.getAllStudentMeta.bind(studentMetaController));

// READ - دریافت اطلاعات متا بر اساس آیدی دانشجو
router.get('/student-meta/student/:studentId', studentMetaController.getStudentMetaByStudentId.bind(studentMetaController));

// READ - دریافت اطلاعات متا بر اساس آیدی خودش
router.get('/student-meta/:id', studentMetaController.getStudentMetaById.bind(studentMetaController));

// UPDATE - بروزرسانی اطلاعات متا
router.put('/student-meta/:id', isUserLoggedIn, studentMetaController.updateStudentMeta.bind(studentMetaController));

// DELETE - حذف اطلاعات متا
router.delete('/student-meta/:id', isUserLoggedIn, studentMetaController.deleteStudentMeta.bind(studentMetaController));





// ==================== TEACHER ROUTES ====================
const teacherController = require("../api/teacher");

// CREATE - ایجاد استاد جدید
router.post('/teacher', isAdmin, teacherImageUpload.single('personalImage'), teacherController.createTeacher.bind(teacherController));

// READ - دریافت اساتید
router.get('/teachers',  teacherController.getAllTeachers.bind(teacherController));
router.get('/teacher/:id', teacherController.getTeacherById.bind(teacherController));
router.get('/teachers/schedule', teacherController.getTeachersBySchedule.bind(teacherController));
router.get('/teachers/subject', teacherController.getTeachersBySubject.bind(teacherController));

// UPDATE - بروزرسانی استاد
router.put('/teacher/:id',isUserLoggedIn, teacherImageUpload.single('personalImage'), teacherController.updateTeacher.bind(teacherController));

// DELETE - حذف استاد
router.delete('/teacher/:id', isAdmin, teacherController.deleteTeacher.bind(teacherController));

// SEARCH - جستجو در اساتید
router.get('/teachers/search', isAdmin, teacherController.searchTeachers.bind(teacherController));








// ==================== COURSE ROUTES ====================
const courseController = require("../api/course");



// CREATE - ایجاد دوره جدید
router.post('/course', isCommunityAdmin, courseImageUpload.single('thumbnail'), (req, res, next) => {
    if (req.file) {
        req.body.thumbnail = `/pic/course/${req.file.filename}`;
    }
    next();
}, courseController.createCourse.bind(courseController));

// READ - دریافت دوره‌ها
router.get('/courses', courseController.getAllCourses.bind(courseController));
router.get('/course/:id', courseController.getCourseById.bind(courseController));
router.get('/courses/available', courseController.getAvailableCourses.bind(courseController));
router.get('/courses/unavailable', courseController.getUnavailableCourses.bind(courseController));

// UPDATE - بروزرسانی دوره
router.put('/course/:id', isCommunityAdmin, courseImageUpload.single('thumbnail'), (req, res, next) => {
    if (req.file) {
        req.body.thumbnail = `/pic/course/${req.file.filename}`;
    }
    next();
}, courseController.updateCourse.bind(courseController));

router.patch('/course/:id/toggle-availability', isCommunityAdmin, courseController.toggleAvailability.bind(courseController));

// DELETE - حذف دوره
router.delete('/course/:id', isCommunityAdmin, courseController.deleteCourse.bind(courseController));

// SEARCH - جستجو در دوره‌ها
router.get('/courses/search', courseController.searchCourses.bind(courseController));

// ==================== COURSE REGISTRATION ROUTES ====================
// CREATE - درخواست ثبت نام در دوره
router.post('/course-registration', isUserLoggedIn, courseController.createRegistration.bind(courseController));

// READ - دریافت تمام درخواست‌های ثبت نام
router.get('/course-registrations',isCommunityAdmin, courseController.getAllRegistrations.bind(courseController));

// READ - دریافت درخواست‌های یک دانشجو
router.get('/course-registrations/student/:studentId', isUserLoggedIn,courseController.getStudentRegistrations.bind(courseController));

// READ - دریافت درخواست‌های یک دوره
router.get('/course-registrations/course/:courseId', isCommunityAdmin ,courseController.getCourseRegistrations.bind(courseController));

// READ - دریافت درخواست بر اساس ID
router.get('/course-registration/:id', isCommunityAdmin, courseController.getRegistrationById.bind(courseController));

// UPDATE - تایید یا رد درخواست
router.patch('/course-registration/:id/approve', isCommunityAdmin, courseController.approveRegistration.bind(courseController));
router.patch('/course-registration/:id/reject', isCommunityAdmin, courseController.rejectRegistration.bind(courseController));

// DELETE - حذف درخواست
router.delete('/course-registration/:id', isCommunityAdmin, courseController.deleteRegistration.bind(courseController));








// ==================== TRAINING CATEGORY ROUTES ====================
const trainingController = require("../api/training");


// CREATE - ایجاد شاخه/زیرشاخه
router.post('/training',isAdmin, trainingFileUpload.single('file'), trainingController.createCategory.bind(trainingController));
// READ - دریافت همه شاخه‌ها (درختی)
router.get('/trainings', trainingController.getAllCategories.bind(trainingController));
// READ - دریافت یک شاخه با زیرشاخه‌ها
router.get('/training/:id', trainingController.getCategoryById.bind(trainingController));
// UPDATE - ویرایش شاخه (با امکان تغییر فایل)
router.put('/training/:id', isAdmin, trainingFileUpload.single('file'), trainingController.updateCategory.bind(trainingController));
// DELETE - حذف شاخه
router.delete('/training/:id', isAdmin, trainingController.deleteCategory.bind(trainingController));
// SEARCH - جستجو در شاخه‌ها
router.get('/trainings/search', trainingController.searchCategories.bind(trainingController));








// ==================== NEWS ROUTES ====================
const newsController = require("../api/news");



// CREATE - ایجاد خبر/اطلاعیه
router.post('/news',isAdminOrTeacher, newsImageUpload.single('image'), newsController.createNews.bind(newsController));
// READ - دریافت همه اخبار/اطلاعیه‌های فعال و منقضی‌نشده
router.get('/news', newsController.getAllNews.bind(newsController));
// READ - دریافت یک خبر/اطلاعیه
router.get('/news/:id', newsController.getNewsById.bind(newsController));
// UPDATE - ویرایش خبر/اطلاعیه
router.put('/news/:id',isAdminOrTeacher, newsImageUpload.single('image'), newsController.updateNews.bind(newsController));
// DELETE - حذف خبر/اطلاعیه
router.delete('/news/:id',isAdminOrTeacher , newsController.deleteNews.bind(newsController));
// SEARCH - جستجو در اخبار/اطلاعیه‌ها
router.get('/news/search', newsController.searchNews.bind(newsController));

// POLL: ثبت و دریافت و حذف نظرسنجی اطلاعیه
router.post('/news/poll', isAdminOrTeacher, newsController.createPoll.bind(newsController));
router.get('/news/:newsId/poll',  newsController.getPollByNewsId.bind(newsController));
router.delete('/news/poll/:pollQuestionId', isAdminOrTeacher, newsController.deletePollQuestion.bind(newsController));

// ==================== POLL VOTE ROUTES ====================
const pollVoteController = require("../api/pollVote");

// CREATE - ثبت رای جدید
router.post('/poll-vote', isUserLoggedIn, pollVoteController.createVote.bind(pollVoteController));

// READ - دریافت تمام رای‌ها
router.get('/poll-votes',  pollVoteController.getAllVotes.bind(pollVoteController));

// READ - دریافت رای بر اساس ID
router.get('/poll-vote/:id',  pollVoteController.getVoteById.bind(pollVoteController));

// READ - دریافت رای‌های یک کاربر
router.get('/poll-votes/user/:userType/:userId',  pollVoteController.getUserVotes.bind(pollVoteController));

// READ - دریافت رای‌های یک سوال
router.get('/poll-votes/question/:pollQuestionId',  pollVoteController.getQuestionVotes.bind(pollVoteController));

// READ - دریافت آمار رای‌ها برای یک سوال
router.get('/poll-votes/stats/:pollQuestionId',  pollVoteController.getQuestionStats.bind(pollVoteController));

// READ - بررسی رای کاربر برای یک سوال
router.get('/poll-vote/check/:userType/:userId/:pollQuestionId' , pollVoteController.checkUserVote.bind(pollVoteController));

// DELETE - حذف رای
router.delete('/poll-vote/:id', isUserLoggedIn, pollVoteController.deleteVote.bind(pollVoteController));


const communityController = require("../api/community");
const aboutUsController = require("../api/aboutCommunity");
const teacherMetaController = require("../api/teachersMeta");

// COMMUNITY ROUTES
router.post('/community', isUserLoggedIn, communityController.createMembership.bind(communityController));
router.get('/community', communityController.getAllMembers.bind(communityController));
router.get('/community/:id',  communityController.getMemberById.bind(communityController));
router.patch('/community/:id/status', isCommunityAdmin, communityController.updateMembershipStatus.bind(communityController));
router.patch('/community/:id/set-manager', isAdmin, communityController.setManager.bind(communityController));
router.patch('/community/:id/unset-manager', isAdmin, communityController.unsetManager.bind(communityController));
router.delete('/community/:id', isCommunityAdmin, communityController.deleteMember.bind(communityController));
// community about us



router.post('/about-us', isCommunityAdmin ,uploadAbout.single('file'), aboutUsController.createSection.bind(aboutUsController));
// لیست همه بخش‌ها
router.get('/about-us', aboutUsController.getAllSections.bind(aboutUsController));
// دریافت بخش خاص
router.get('/about-us/:id', aboutUsController.getSection.bind(aboutUsController));
// ویرایش بخش
router.put('/about-us/:id', isCommunityAdmin, uploadAbout.single('file'), aboutUsController.updateSection.bind(aboutUsController));
// حذف بخش
router.delete('/about-us/:id', isCommunityAdmin, aboutUsController.deleteSection.bind(aboutUsController));

// تغییر ترتیب بخش‌ها
router.patch('/about-us/reorder', isCommunityAdmin, aboutUsController.reorderSections.bind(aboutUsController));


const settingController = require("../api/setting");
const reservationController = require("../api/reservation");



// SETTINGS ROUTES
router.get('/settings', settingController.getSettings.bind(settingController));
router.get('/logs', isAdmin ,settingController.getLogs.bind(settingController));
router.get('/logs/teacher/:teacherId', isUserLoggedIn, settingController.getTeacherLogs.bind(settingController));
router.put('/settings', isAdmin, settingController.updateSettings.bind(settingController));
router.post('/settings/logo/upload', isAdmin, settingsImageUpload.single('logo'), settingController.uploadLogo.bind(settingController));
router.post('/settings/gallery', isAdmin, settingController.addGalleryImage.bind(settingController));
router.post('/settings/gallery/upload', isAdmin, settingsImageUpload.single('image'), settingController.uploadGalleryImage.bind(settingController));
router.put('/settings/gallery/:index', isAdmin, settingController.updateGalleryImage.bind(settingController));
router.delete('/settings/gallery/:index', isAdmin, settingController.deleteGalleryImage.bind(settingController));

// SITE ABOUT US ROUTES
router.post('/settings/about-us', isAdmin, uploadSiteAbout.single('file'), settingController.createAboutUsSection.bind(settingController));
router.get('/settings/about-us', settingController.getAllAboutUsSections.bind(settingController));
router.get('/settings/about-us/:id', settingController.getAboutUsSection.bind(settingController));
router.put('/settings/about-us/:id', isAdmin, uploadSiteAbout.single('file'), settingController.updateAboutUsSection.bind(settingController));
router.delete('/settings/about-us/:id', isAdmin, settingController.deleteAboutUsSection.bind(settingController));
router.patch('/settings/about-us/reorder', isAdmin, settingController.reorderAboutUsSections.bind(settingController));

// TEACHER META ROUTES (وبلاگ شخصی اساتید)
router.post('/teacher-meta', isUserLoggedIn, uploadTeacherMeta.single('file'), teacherMetaController.createMeta.bind(teacherMetaController));
router.get('/teacher-meta/:teacherId', teacherMetaController.getTeacherMeta.bind(teacherMetaController));
router.get('/teacher-meta/:teacherId/:id', teacherMetaController.getMetaById.bind(teacherMetaController));
router.put('/teacher-meta/:id', isUserLoggedIn, uploadTeacherMeta.single('file'), teacherMetaController.updateMeta.bind(teacherMetaController));
router.delete('/teacher-meta/:id', isUserLoggedIn, teacherMetaController.deleteMeta.bind(teacherMetaController));
router.patch('/teacher-meta/:teacherId/reorder', isUserLoggedIn, teacherMetaController.reorderMeta.bind(teacherMetaController));
router.patch('/teacher-meta/:id/toggle-publish', isUserLoggedIn, teacherMetaController.togglePublish.bind(teacherMetaController));

// DASHBOARD STATS ROUTE
router.get('/dashboard-stats', isAdmin , settingController.getDashboardStats.bind(settingController));

// ==================== RESERVATION ROUTES ====================
// CREATE - ایجاد درخواست رزرو جدید
router.post('/reservation', isUserLoggedIn, reservationController.createReservation.bind(reservationController));

// READ - دریافت تمام رزروها
router.get('/reservations', isUserLoggedIn , reservationController.getAllReservations.bind(reservationController));

// READ - دریافت رزرو بر اساس ID
router.get('/reservation/:id', isUserLoggedIn, reservationController.getReservationById.bind(reservationController));

// READ - دریافت رزروهای یک دانشجو
router.get('/reservations/student/:studentId', isUserLoggedIn, reservationController.getStudentReservations.bind(reservationController));

// READ - دریافت رزروهای یک استاد
router.get('/reservations/teacher/:teacherId', isUserLoggedIn, reservationController.getTeacherReservations.bind(reservationController));

// UPDATE - تایید رزرو
router.patch('/reservation/:id/approve', isUserLoggedIn, reservationController.approveReservation.bind(reservationController));

// UPDATE - رد رزرو
router.patch('/reservation/:id/reject', isUserLoggedIn, reservationController.rejectReservation.bind(reservationController));

// UPDATE - لغو رزرو
router.patch('/reservation/:id/cancel', isUserLoggedIn, reservationController.cancelReservation.bind(reservationController));

// UPDATE - بروزرسانی رزرو
router.put('/reservation/:id', isUserLoggedIn, reservationController.updateReservation.bind(reservationController));

// DELETE - حذف رزرو
router.delete('/reservation/:id', isUserLoggedIn, reservationController.deleteReservation.bind(reservationController));

// READ - دریافت آمار رزروها
router.get('/reservations/stats', isUserLoggedIn, reservationController.getReservationStats.bind(reservationController));




async function isAdmin(req, res, next) {
    if (req.session && req.session.admin && req.session.admin.role === 'admin') {
        let admin = await models.Admin.findOne({ where: { username: req.session.admin.username } });
        
        if (req.session.admin.username === admin.username) {
            return next();
        }
    }
    return res.status(403).json({ success: false, message: 'دسترسی فقط برای ادمین مجاز است.' });
}

function isUserLoggedIn(req, res, next) {
    if (req.session && req.session.user || req.session && req.session.admin) {
        return next();
    }
    return res.status(401).json({ success: false, message: 'لطفاً ابتدا وارد شوید.' });
}

// Middleware نقش مدیر انجمن
function isCommunityAdmin(req, res, next) {
    console.log(req.session.admin);
    if (req.session && req.session.admin) {
        // اگر مدیر انجمن است
        if (req.session.admin.role === 'communityAdmin') {
            return next();
        }
        // اگر ادمین واقعی است
        if (req.session.admin.role === 'admin') {
                return next();
        }
    }
    return res.status(403).json({ success: false, message: 'دسترسی فقط برای مدیر انجمن یا ادمین مجاز است.' });
}

function isMainAdmin(req, res, next) {
    if (req.session && req.session.admin && req.session.admin.username === "mainAdmin") {
        return next()
    }
    return res.status(403).json({ success: false, message: 'شما دسترسی مورد نیاز را ندارید' });

}
// ... existing code ...
// Check if user is admin or teacher
function isAdminOrTeacher(req, res, next) {
    if (
        (req.session && req.session.admin && req.session.admin.role === 'admin') ||
        (req.session && req.session.admin && req.session.admin.role === 'communityAdmin') ||
        (req.session && req.session.user && req.session.user.type === 'teacher')
    ) {
        return next();
    }
    return res.status(403).json({ success: false, message: 'دسترسی فقط برای ادمین یا دبیر مجاز است.' });
}
// ... existing code ...

// آمار سایت
router.get('/site-stats', async (req, res) => {
    try {
        // تعداد کل دانشجویان
        const studentCount = await models.Student.count();
        // تعداد کل اساتید
        const teacherCount = await models.Teacher.count();
        // تعداد کل اعضای انجمن
        const communityCount = await models.Community.count();
        // تعداد کل فایل‌های آموزشی
        const trainingCount = await models.Training.count();
        // تعداد کل ادمین‌ها
        const adminCount = await models.Admin.count();
        // تعداد کل اخبار
        const newsCount = await models.News.count();
        // تعداد کل رزروها
        const reservationCount = await models.Reservation.count();
        // تعداد کل نظرسنجی‌ها
        const pollCount = await models.PollQuestion ? await models.PollQuestion.count() : 0;
        // تعداد کل رای‌ها
        const pollVoteCount = await models.PollVote ? await models.PollVote.count() : 0;
        // تعداد کاربران آنلاین (ساده: تعداد session های فعال)
        let onlineUsers = 0;
        if (req.sessionStore && req.sessionStore.all) {
            req.sessionStore.all((err, sessions) => {
                if (!err && sessions) {
                    onlineUsers = Object.keys(sessions).length;
                }
                res.json({
                    studentCount,
                    teacherCount,
                    communityCount,
                    trainingCount,
                    adminCount,
                    newsCount,
                    reservationCount,
                    pollCount,
                    pollVoteCount,
                    onlineUsers
                });
            });
        } else {
            res.json({
                studentCount,
                teacherCount,
                communityCount,
                trainingCount,
                adminCount,
                newsCount,
                reservationCount,
                pollCount,
                pollVoteCount,
                onlineUsers: null
            });
        }
    } catch (err) {
        res.status(500).json({ message: 'خطا در دریافت آمار سایت', error: err.message });
    }
});

module.exports = router;
