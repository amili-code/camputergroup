const express = require("express");
const router = express.Router();
const multer = require('multer');

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
router.post('/student', isAdmin, studentController.createStudent.bind(studentController));

// READ - دریافت دانشجویان
router.get('/students', isAdmin, studentController.getAllStudents.bind(studentController));
router.get('/student/:id', isAdmin, studentController.getStudentById.bind(studentController));
router.get('/students/graduated', isAdmin, studentController.getGraduatedStudents.bind(studentController));
router.get('/students/active', isAdmin, studentController.getActiveStudents.bind(studentController));

// UPDATE - بروزرسانی دانشجو
router.put('/student/:id', isAdmin, studentController.updateStudent.bind(studentController));
router.patch('/student/:id/toggle-graduation', isAdmin, studentController.toggleGraduationStatus.bind(studentController));

// DELETE - حذف دانشجو
router.delete('/student/:id', isAdmin, studentController.deleteStudent.bind(studentController));

// SEARCH - جستجو در دانشجویان
router.get('/students/search', isAdmin, studentController.searchStudents.bind(studentController));





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
router.post('/news',isCommunityAdmin, newsImageUpload.single('image'), newsController.createNews.bind(newsController));
// READ - دریافت همه اخبار/اطلاعیه‌های فعال و منقضی‌نشده
router.get('/news', newsController.getAllNews.bind(newsController));
// READ - دریافت یک خبر/اطلاعیه
router.get('/news/:id', newsController.getNewsById.bind(newsController));
// UPDATE - ویرایش خبر/اطلاعیه
router.put('/news/:id',isCommunityAdmin, newsImageUpload.single('image'), newsController.updateNews.bind(newsController));
// DELETE - حذف خبر/اطلاعیه
router.delete('/news/:id',isCommunityAdmin, newsController.deleteNews.bind(newsController));
// SEARCH - جستجو در اخبار/اطلاعیه‌ها
router.get('/news/search', newsController.searchNews.bind(newsController));

// POLL: ثبت و دریافت و حذف نظرسنجی اطلاعیه
router.post('/news/poll', isCommunityAdmin, newsController.createPoll.bind(newsController));
router.get('/news/:newsId/poll',  newsController.getPollByNewsId.bind(newsController));
router.delete('/news/poll/:pollQuestionId', isCommunityAdmin, newsController.deletePollQuestion.bind(newsController));

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

// COMMUNITY ROUTES
router.post('/community', isUserLoggedIn, communityController.createMembership.bind(communityController));
router.get('/community', communityController.getAllMembers.bind(communityController));
router.get('/community/:id',  communityController.getMemberById.bind(communityController));
router.patch('/community/:id/status', isCommunityAdmin, communityController.updateMembershipStatus.bind(communityController));
router.patch('/community/:id/set-manager', isAdmin, communityController.setManager.bind(communityController));
router.patch('/community/:id/unset-manager', isAdmin, communityController.unsetManager.bind(communityController));
router.delete('/community/:id', isCommunityAdmin, communityController.deleteMember.bind(communityController));

const settingController = require("../api/setting");
const reservationController = require("../api/reservation");



// SETTINGS ROUTES
router.get('/settings', settingController.getSettings.bind(settingController));
router.put('/settings', isAdmin, settingController.updateSettings.bind(settingController));
router.post('/settings/gallery', isAdmin, settingController.addGalleryImage.bind(settingController));
router.post('/settings/gallery/upload', isAdmin, settingsImageUpload.single('image'), settingController.uploadGalleryImage.bind(settingController));
router.put('/settings/gallery/:index', isAdmin, settingController.updateGalleryImage.bind(settingController));
router.delete('/settings/gallery/:index', isAdmin, settingController.deleteGalleryImage.bind(settingController));

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




function isAdmin(req, res, next) {
    if (req.session && req.session.admin && req.session.admin.role === 'admin') {
        // بررسی نام کاربری با admin.json
        const fs = require('fs');
        const path = require('path');
        const adminPath = path.join(__dirname, '../../scripts/admin.json');
        let adminData = JSON.parse(fs.readFileSync(adminPath, 'utf8'));
        if (req.session.admin.username === adminData.admin.username) {
            return next();
        }
    }
    return res.status(403).json({ success: false, message: 'دسترسی فقط برای ادمین مجاز است.' });
}

function isUserLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ success: false, message: 'لطفاً ابتدا وارد شوید.' });
}

// Middleware نقش مدیر انجمن
function isCommunityAdmin(req, res, next) {
    if (req.session && req.session.admin) {
        // اگر مدیر انجمن است
        if (req.session.admin.role === 'communityAdmin') {
            return next();
        }
        // اگر ادمین واقعی است
        if (req.session.admin.role === 'admin') {
            const fs = require('fs');
            const path = require('path');
            const adminPath = path.join(__dirname, '../../scripts/admin.json');
            let adminData = JSON.parse(fs.readFileSync(adminPath, 'utf8'));
            if (req.session.admin.username === adminData.admin.username) {
                return next();
            }
        }
    }
    return res.status(403).json({ success: false, message: 'دسترسی فقط برای مدیر انجمن یا ادمین مجاز است.' });
}

module.exports = router;
