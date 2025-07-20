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

module.exports = router;
