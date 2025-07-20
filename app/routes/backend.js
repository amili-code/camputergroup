const express = require("express");
const router = express.Router();
const multer = require('multer');

// تنظیمات آپلود تصاویر
const picStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/pic");
    },
    filename: function (req, file, cb) {
        // ایجاد نام منحصر به فرد برای فایل
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'blog-' + uniqueSuffix + '-' + file.originalname);
    }
});

const picUpload = multer({ 
    storage: picStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // حداکثر 5 مگابایت
        files: 10 // حداکثر 10 فایل
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


// ==================== BLOG ROUTES ====================
// const blogController = require("../api/blog");

// CREATE - ایجاد وبلاگ جدید
// router.post('/blog', picUpload.array('images', 10), blogController.createBlog.bind(blogController));

// // READ - دریافت وبلاگ‌ها
// router.get('/blogs', blogController.getAllBlogs.bind(blogController));
// router.get('/blog/:id', blogController.getBlogById.bind(blogController));
// router.get('/blogs/active', blogController.getActiveBlogs.bind(blogController));
// router.get('/blogs/featured', blogController.getFeaturedBlogs.bind(blogController));

// // UPDATE - بروزرسانی وبلاگ
// router.put('/blog/:id', picUpload.array('images', 10), blogController.updateBlog.bind(blogController));
// router.patch('/blog/:id/toggle-status', blogController.toggleBlogStatus.bind(blogController));
// router.patch('/blog/:id/toggle-featured', blogController.toggleFeaturedStatus.bind(blogController));

// // DELETE - حذف وبلاگ
// router.delete('/blog/:id', blogController.deleteBlog.bind(blogController));
// router.delete('/blog/:id/image/:imageIndex', blogController.deleteBlogImage.bind(blogController));

// // SEARCH - جستجو در وبلاگ‌ها
// router.get('/blogs/search', blogController.searchBlogs.bind(blogController));

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








module.exports = router;
