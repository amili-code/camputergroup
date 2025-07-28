const { models } = require('../config/models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// JWT Secret Key - در محیط تولید باید از متغیر محیطی استفاده شود
const JWT_SECRET = process.env.JWT_SECRET || '1234567890';

class AuthController {
    // Student Login
    async studentLogin(req, res) {
        try {
            const { studentId, password } = req.body;

            // اعتبارسنجی داده‌های ورودی
            if (!studentId || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'نام کاربری و رمز عبور الزامی است'
                });
            }

            // جستجوی دانشجو بر اساس کد پرسنلی (نام کاربری)
            const student = await models.Student.findOne({ 
                where: { studentId: studentId }
            });

            if (!student) {
                return res.status(401).json({
                    success: false,
                    message: 'نام کاربری یا رمز عبور اشتباه است'
                });
            }

            // بررسی رمز عبور
            const isPasswordValid = await bcrypt.compare(password, student.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'نام کاربری یا رمز عبور اشتباه است'
                });
            }

            // بررسی وضعیت فارغ التحصیلی
            if (student.isGraduated) {
                return res.status(403).json({
                    success: false,
                    message: 'حساب کاربری شما غیرفعال است. لطفاً با مدیر سیستم تماس بگیرید.'
                });
            }

            // ایجاد JWT Token
            const token = jwt.sign(
                {
                    id: student.id,
                    studentId: student.studentId,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    type: 'student'
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // ذخیره اطلاعات در session
            if (req.session) {
                req.session.user = {
                    id: student.id,
                    studentId: student.studentId,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    type: 'student',
                    token: token
                };
            }

            // ارسال پاسخ موفق
            res.json({
                success: true,
                message: 'ورود موفقیت‌آمیز بود',
                data: {
                    user: {
                        id: student.id,
                        studentId: student.studentId,
                        firstName: student.firstName,
                        lastName: student.lastName,
                        type: 'student'
                    },
                    token: token,
                    sessionAvailable: !!req.session
                }
            });

        } catch (error) {
            console.error('خطا در ورود دانشجو:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در ورود به سیستم',
                error: error.message
            });
        }
    }

    // Teacher Login
    async teacherLogin(req, res) {
        try {
            const { teacherId, password } = req.body;

            // اعتبارسنجی داده‌های ورودی
            if (!teacherId || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'نام کاربری و رمز عبور الزامی است'
                });
            }

            // جستجوی استاد بر اساس کد پرسنلی (نام کاربری)
            const teacher = await models.Teacher.findOne({ 
                where: { teacherId: teacherId }
            });

            if (!teacher) {
                return res.status(401).json({
                    success: false,
                    message: 'نام کاربری یا رمز عبور اشتباه است'
                });
            }

            // بررسی رمز عبور
            const isPasswordValid = await bcrypt.compare(password, teacher.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'نام کاربری یا رمز عبور اشتباه است'
                });
            }

            // ایجاد JWT Token
            const token = jwt.sign(
                {
                    id: teacher.id,
                    teacherId: teacher.teacherId,
                    firstName: teacher.firstName,
                    lastName: teacher.lastName,
                    type: 'teacher'
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // ذخیره اطلاعات در session
            if (req.session) {
                req.session.user = {
                    id: teacher.id,
                    teacherId: teacher.teacherId,
                    firstName: teacher.firstName,
                    lastName: teacher.lastName,
                    type: 'teacher',
                    token: token
                };
            }

            // ارسال پاسخ موفق
            res.json({
                success: true,
                message: 'ورود موفقیت‌آمیز بود',
                data: {
                    user: {
                        id: teacher.id,
                        teacherId: teacher.teacherId,
                        firstName: teacher.firstName,
                        lastName: teacher.lastName,
                        type: 'teacher'
                    },
                    token: token,
                    sessionAvailable: !!req.session
                }
            });

        } catch (error) {
            console.error('خطا در ورود استاد:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در ورود به سیستم',
                error: error.message
            });
        }
    }

    // Logout
    async logout(req, res) {
        try {
            // Check if session exists
            if (req.session) {
                // حذف اطلاعات از session
                req.session.destroy((err) => {
                    if (err) {
                        console.error('خطا در حذف session:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'خطا در خروج از سیستم'
                        });
                    }

                    // حذف کوکی session
                    res.clearCookie('connect.sid');
                    
                    res.json({
                        success: true,
                        message: 'خروج موفقیت‌آمیز بود'
                    });
                });
            } else {
                // If no session exists, just return success
                res.clearCookie('connect.sid');
                res.json({
                    success: true,
                    message: 'خروج موفقیت‌آمیز بود'
                });
            }

        } catch (error) {
            console.error('خطا در خروج:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در خروج از سیستم',
                error: error.message
            });
        }
    }

    // Verify Token Middleware
    verifyToken(req, res, next) {
        const token = req.headers.authorization?.split(' ')[1] || (req.session && req.session.user ? req.session.user.token : null);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'توکن احراز هویت یافت نشد'
            });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            console.error('خطا در تایید توکن:', error);
            return res.status(401).json({
                success: false,
                message: 'توکن نامعتبر است'
            });
        }
    }

    // Get Current User
    async getCurrentUser(req, res) {
        try {
            // Check if session exists and has user data
            if (!req.session || !req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: 'کاربر وارد نشده است'
                });
            }

            res.json({
                success: true,
                data: {
                    user: req.session.user
                }
            });

        } catch (error) {
            console.error('خطا در دریافت اطلاعات کاربر:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت اطلاعات کاربر',
                error: error.message
            });
        }
    }

    // Check if user is authenticated
    isAuthenticated(req, res, next) {
        if (req.session && req.session.user) {
            next();
        } else {
            res.status(401).json({
                success: false,
                message: 'لطفاً ابتدا وارد سیستم شوید'
            });
        }
    }

    // Check if user is teacher
    isTeacher(req, res, next) {
        if (req.session && req.session.user && req.session.user.type === 'teacher') {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: 'دسترسی غیرمجاز - فقط اساتید'
            });
        }
    }

    // Check if user is student
    isStudent(req, res, next) {
        if (req.session && req.session.user && req.session.user.type === 'student') {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: 'دسترسی غیرمجاز - فقط دانشجویان'
            });
        }
    }
}

module.exports = new AuthController();