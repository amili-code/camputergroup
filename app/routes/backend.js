const express = require("express");
const router = express.Router();
const multer = require('multer');



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

// ==================== STUDENT ROUTES ====================
const studentController = require("../api/student");

// CREATE - ایجاد دانشجوی جدید
router.post('/student', studentController.createStudent.bind(studentController));

// READ - دریافت دانشجویان
router.get('/students', studentController.getAllStudents.bind(studentController));
router.get('/student/:id', studentController.getStudentById.bind(studentController));
router.get('/students/graduated', studentController.getGraduatedStudents.bind(studentController));
router.get('/students/active', studentController.getActiveStudents.bind(studentController));

// UPDATE - بروزرسانی دانشجو
router.put('/student/:id', studentController.updateStudent.bind(studentController));
router.patch('/student/:id/toggle-graduation', studentController.toggleGraduationStatus.bind(studentController));

// DELETE - حذف دانشجو
router.delete('/student/:id', studentController.deleteStudent.bind(studentController));

// SEARCH - جستجو در دانشجویان
router.get('/students/search', studentController.searchStudents.bind(studentController));





// ==================== TEACHER ROUTES ====================
const teacherController = require("../api/teacher");

// CREATE - ایجاد استاد جدید
router.post('/teacher', teacherImageUpload.single('personalImage'), teacherController.createTeacher.bind(teacherController));

// READ - دریافت اساتید
router.get('/teachers', teacherController.getAllTeachers.bind(teacherController));
router.get('/teacher/:id', teacherController.getTeacherById.bind(teacherController));
router.get('/teachers/schedule', teacherController.getTeachersBySchedule.bind(teacherController));
router.get('/teachers/subject', teacherController.getTeachersBySubject.bind(teacherController));

// UPDATE - بروزرسانی استاد
router.put('/teacher/:id', teacherImageUpload.single('personalImage'), teacherController.updateTeacher.bind(teacherController));

// DELETE - حذف استاد
router.delete('/teacher/:id', teacherController.deleteTeacher.bind(teacherController));

// SEARCH - جستجو در اساتید
router.get('/teachers/search', teacherController.searchTeachers.bind(teacherController));








// ==================== COURSE ROUTES ====================
const courseController = require("../api/course");

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

// CREATE - ایجاد دوره جدید
router.post('/course', courseImageUpload.single('thumbnail'), (req, res, next) => {
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
router.put('/course/:id', courseImageUpload.single('thumbnail'), (req, res, next) => {
    if (req.file) {
        req.body.thumbnail = `/pic/course/${req.file.filename}`;
    }
    next();
}, courseController.updateCourse.bind(courseController));
router.patch('/course/:id/toggle-availability', courseController.toggleAvailability.bind(courseController));

// DELETE - حذف دوره
router.delete('/course/:id', courseController.deleteCourse.bind(courseController));

// SEARCH - جستجو در دوره‌ها
router.get('/courses/search', courseController.searchCourses.bind(courseController));

// ==================== COURSE REGISTRATION ROUTES ====================
// CREATE - درخواست ثبت نام در دوره
router.post('/course-registration', courseController.createRegistration.bind(courseController));

// READ - دریافت تمام درخواست‌های ثبت نام
router.get('/course-registrations', courseController.getAllRegistrations.bind(courseController));

// READ - دریافت درخواست‌های یک دانشجو
router.get('/course-registrations/student/:studentId', courseController.getStudentRegistrations.bind(courseController));

// READ - دریافت درخواست‌های یک دوره
router.get('/course-registrations/course/:courseId', courseController.getCourseRegistrations.bind(courseController));

// READ - دریافت درخواست بر اساس ID
router.get('/course-registration/:id', courseController.getRegistrationById.bind(courseController));

// UPDATE - تایید یا رد درخواست
router.patch('/course-registration/:id/approve', courseController.approveRegistration.bind(courseController));
router.patch('/course-registration/:id/reject', courseController.rejectRegistration.bind(courseController));

// DELETE - حذف درخواست
router.delete('/course-registration/:id', courseController.deleteRegistration.bind(courseController));








// ==================== TRAINING CATEGORY ROUTES ====================
const trainingController = require("../api/training");

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

// CREATE - ایجاد شاخه/زیرشاخه
router.post('/training', trainingFileUpload.single('file'), trainingController.createCategory.bind(trainingController));
// READ - دریافت همه شاخه‌ها (درختی)
router.get('/trainings', trainingController.getAllCategories.bind(trainingController));
// READ - دریافت یک شاخه با زیرشاخه‌ها
router.get('/training/:id', trainingController.getCategoryById.bind(trainingController));
// UPDATE - ویرایش شاخه (با امکان تغییر فایل)
router.put('/training/:id', trainingFileUpload.single('file'), trainingController.updateCategory.bind(trainingController));
// DELETE - حذف شاخه
router.delete('/training/:id', trainingController.deleteCategory.bind(trainingController));
// SEARCH - جستجو در شاخه‌ها
router.get('/trainings/search', trainingController.searchCategories.bind(trainingController));








// ==================== NEWS ROUTES ====================
const newsController = require("../api/news");

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

// CREATE - ایجاد خبر/اطلاعیه
router.post('/news', newsImageUpload.single('image'), newsController.createNews.bind(newsController));
// READ - دریافت همه اخبار/اطلاعیه‌های فعال و منقضی‌نشده
router.get('/news', newsController.getAllNews.bind(newsController));
// READ - دریافت یک خبر/اطلاعیه
router.get('/news/:id', newsController.getNewsById.bind(newsController));
// UPDATE - ویرایش خبر/اطلاعیه
router.put('/news/:id', newsImageUpload.single('image'), newsController.updateNews.bind(newsController));
// DELETE - حذف خبر/اطلاعیه
router.delete('/news/:id', newsController.deleteNews.bind(newsController));
// SEARCH - جستجو در اخبار/اطلاعیه‌ها
router.get('/news/search', newsController.searchNews.bind(newsController));

// POLL: ثبت و دریافت و حذف نظرسنجی اطلاعیه
router.post('/news/poll', newsController.createPoll.bind(newsController));
router.get('/news/:newsId/poll', newsController.getPollByNewsId.bind(newsController));
router.delete('/news/poll/:pollQuestionId', newsController.deletePollQuestion.bind(newsController));


const communityController = require("../api/community");

// COMMUNITY ROUTES
router.post('/community', communityController.createMembership.bind(communityController));
router.get('/community', communityController.getAllMembers.bind(communityController));
router.get('/community/:id', communityController.getMemberById.bind(communityController));
router.patch('/community/:id/status', communityController.updateMembershipStatus.bind(communityController));
router.patch('/community/:id/set-manager', communityController.setManager.bind(communityController));
router.patch('/community/:id/unset-manager', communityController.unsetManager.bind(communityController));
router.delete('/community/:id', communityController.deleteMember.bind(communityController));

const settingController = require("../api/setting");
const reservationController = require("../api/reservation");

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

// SETTINGS ROUTES
router.get('/settings', settingController.getSettings.bind(settingController));
router.put('/settings', settingController.updateSettings.bind(settingController));
router.post('/settings/gallery', settingController.addGalleryImage.bind(settingController));
router.post('/settings/gallery/upload', settingsImageUpload.single('image'), settingController.uploadGalleryImage.bind(settingController));
router.put('/settings/gallery/:index', settingController.updateGalleryImage.bind(settingController));
router.delete('/settings/gallery/:index', settingController.deleteGalleryImage.bind(settingController));

// DASHBOARD STATS ROUTE
router.get('/dashboard-stats', settingController.getDashboardStats.bind(settingController));

// ==================== RESERVATION ROUTES ====================
// CREATE - ایجاد درخواست رزرو جدید
router.post('/reservation', reservationController.createReservation.bind(reservationController));

// READ - دریافت تمام رزروها
router.get('/reservations', reservationController.getAllReservations.bind(reservationController));

// READ - دریافت رزرو بر اساس ID
router.get('/reservation/:id', reservationController.getReservationById.bind(reservationController));

// READ - دریافت رزروهای یک دانشجو
router.get('/reservations/student/:studentId', reservationController.getStudentReservations.bind(reservationController));

// READ - دریافت رزروهای یک استاد
router.get('/reservations/teacher/:teacherId', reservationController.getTeacherReservations.bind(reservationController));

// UPDATE - تایید رزرو
router.patch('/reservation/:id/approve', reservationController.approveReservation.bind(reservationController));

// UPDATE - رد رزرو
router.patch('/reservation/:id/reject', reservationController.rejectReservation.bind(reservationController));

// UPDATE - لغو رزرو
router.patch('/reservation/:id/cancel', reservationController.cancelReservation.bind(reservationController));

// UPDATE - بروزرسانی رزرو
router.put('/reservation/:id', reservationController.updateReservation.bind(reservationController));

// DELETE - حذف رزرو
router.delete('/reservation/:id', reservationController.deleteReservation.bind(reservationController));

// READ - دریافت آمار رزروها
router.get('/reservations/stats', reservationController.getReservationStats.bind(reservationController));

// ==================== POLL VOTE ROUTES ====================
const pollVoteController = require("../api/pollVote");

// CREATE - ثبت رای جدید
router.post('/poll-vote', pollVoteController.createVote.bind(pollVoteController));

// READ - دریافت تمام رای‌ها
router.get('/poll-votes', pollVoteController.getAllVotes.bind(pollVoteController));

// READ - دریافت رای بر اساس ID
router.get('/poll-vote/:id', pollVoteController.getVoteById.bind(pollVoteController));

// READ - دریافت رای‌های یک کاربر
router.get('/poll-votes/user/:userType/:userId', pollVoteController.getUserVotes.bind(pollVoteController));

// READ - دریافت رای‌های یک سوال
router.get('/poll-votes/question/:pollQuestionId', pollVoteController.getQuestionVotes.bind(pollVoteController));

// READ - دریافت آمار رای‌ها برای یک سوال
router.get('/poll-votes/stats/:pollQuestionId', pollVoteController.getQuestionStats.bind(pollVoteController));

// READ - بررسی رای کاربر برای یک سوال
router.get('/poll-vote/check/:userType/:userId/:pollQuestionId', pollVoteController.checkUserVote.bind(pollVoteController));

// DELETE - حذف رای
router.delete('/poll-vote/:id', pollVoteController.deleteVote.bind(pollVoteController));

module.exports = router;
