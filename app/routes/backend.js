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


module.exports = router;
