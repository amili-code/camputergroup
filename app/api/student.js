const { models, sequelize } = require('../config/models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

class StudentController {
    // CREATE - ایجاد دانشجوی جدید
    async createStudent(req, res) {
        try {
            const { firstName, lastName, password, phone, nationalCode, isGraduated } = req.body;

            // اعتبارسنجی داده‌های ورودی
            if (!firstName || !lastName || !password || !phone || !nationalCode) {
                return res.status(400).json({
                    success: false,
                    message: 'تمام فیلدهای اجباری باید پر شوند'
                });
            }

            // بررسی تکراری نبودن شماره تلفن
            const existingPhone = await models.Student.findOne({ where: { phone } });
            if (existingPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'این شماره تلفن قبلاً ثبت شده است'
                });
            }

            // بررسی تکراری نبودن کد ملی
            const existingNationalCode = await models.Student.findOne({ where: { nationalCode } });
            if (existingNationalCode) {
                return res.status(400).json({
                    success: false,
                    message: 'این کد ملی قبلاً ثبت شده است'
                });
            }

            // هش کردن رمز عبور
            const hashedPassword = await bcrypt.hash(password, 10);

            // ایجاد دانشجوی جدید
            const student = await models.Student.create({
                firstName,
                lastName,
                password: hashedPassword,
                phone,
                nationalCode,
                isGraduated: isGraduated || false
            });

            // حذف رمز عبور از پاسخ
            const studentResponse = student.toJSON();
            delete studentResponse.password;

            res.status(201).json({
                success: true,
                message: 'دانشجو با موفقیت ایجاد شد',
                data: studentResponse
            });

        } catch (error) {
            console.error('خطا در ایجاد دانشجو:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در ایجاد دانشجو',
                error: error.message
            });
        }
    }

    // READ - دریافت تمام دانشجویان
    async getAllStudents(req, res) {
        try {
            const { sortBy = 'studentId', sortOrder = 'ASC' } = req.query;

            // تنظیمات مرتب‌سازی
            const order = [[sortBy, sortOrder.toUpperCase()]];

            // دریافت تمام دانشجویان بدون صفحه‌بندی
            const students = await models.Student.findAll({
                order,
                attributes: { exclude: ['password'] } // حذف رمز عبور از نتایج
            });

            res.json({
                success: true,
                message: 'دانشجویان با موفقیت دریافت شدند',
                data: students
            });

        } catch (error) {
            console.error('خطا در دریافت دانشجویان:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت دانشجویان',
                error: error.message
            });
        }
    }

    // READ - دریافت دانشجو بر اساس ID
    async getStudentById(req, res) {
        try {
            const { id } = req.params;

            const student = await models.Student.findByPk(id, {
                attributes: { exclude: ['password'] }
            });

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'دانشجو یافت نشد'
                });
            }

            res.json({
                success: true,
                message: 'دانشجو با موفقیت دریافت شد',
                data: student
            });

        } catch (error) {
            console.error('خطا در دریافت دانشجو:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت دانشجو',
                error: error.message
            });
        }
    }

    // READ - دریافت دانشجویان فارغ التحصیل
    async getGraduatedStudents(req, res) {
        try {
            const students = await models.Student.findAll({
                where: { isGraduated: true },
                attributes: { exclude: ['password'] },
                order: [['studentId', 'ASC']]
            });

            res.json({
                success: true,
                message: 'دانشجویان فارغ التحصیل با موفقیت دریافت شدند',
                data: students
            });

        } catch (error) {
            console.error('خطا در دریافت دانشجویان فارغ التحصیل:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت دانشجویان فارغ التحصیل',
                error: error.message
            });
        }
    }

    // READ - دریافت دانشجویان فعال (غیر فارغ التحصیل)
    async getActiveStudents(req, res) {
        try {
            const students = await models.Student.findAll({
                where: { isGraduated: false },
                attributes: { exclude: ['password'] },
                order: [['studentId', 'ASC']]
            });

            res.json({
                success: true,
                message: 'دانشجویان فعال با موفقیت دریافت شدند',
                data: students
            });

        } catch (error) {
            console.error('خطا در دریافت دانشجویان فعال:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت دانشجویان فعال',
                error: error.message
            });
        }
    }

    // UPDATE - بروزرسانی دانشجو
    async updateStudent(req, res) {
        try {
            const { id } = req.params;
            const { firstName, lastName, password, phone, nationalCode, isGraduated } = req.body;

            // بررسی وجود دانشجو
            const student = await models.Student.findByPk(id);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'دانشجو یافت نشد'
                });
            }

            // بررسی تکراری نبودن شماره تلفن (اگر تغییر کرده باشد)
            if (phone && phone !== student.phone) {
                const existingPhone = await models.Student.findOne({ where: { phone } });
                if (existingPhone) {
                    return res.status(400).json({
                        success: false,
                        message: 'این شماره تلفن قبلاً ثبت شده است'
                    });
                }
            }

            // بررسی تکراری نبودن کد ملی (اگر تغییر کرده باشد)
            if (nationalCode && nationalCode !== student.nationalCode) {
                const existingNationalCode = await models.Student.findOne({ where: { nationalCode } });
                if (existingNationalCode) {
                    return res.status(400).json({
                        success: false,
                        message: 'این کد ملی قبلاً ثبت شده است'
                    });
                }
            }

            // آماده‌سازی داده‌های بروزرسانی
            const updateData = {};
            if (firstName) updateData.firstName = firstName;
            if (lastName) updateData.lastName = lastName;
            if (phone) updateData.phone = phone;
            if (nationalCode) updateData.nationalCode = nationalCode;
            if (typeof isGraduated === 'boolean') updateData.isGraduated = isGraduated;

            // بروزرسانی رمز عبور (اگر ارائه شده باشد)
            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }

            // بروزرسانی دانشجو
            await student.update(updateData);

            // حذف رمز عبور از پاسخ
            const studentResponse = student.toJSON();
            delete studentResponse.password;

            res.json({
                success: true,
                message: 'دانشجو با موفقیت بروزرسانی شد',
                data: studentResponse
            });

        } catch (error) {
            console.error('خطا در بروزرسانی دانشجو:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در بروزرسانی دانشجو',
                error: error.message
            });
        }
    }

    // UPDATE - تغییر وضعیت فارغ التحصیلی
    async toggleGraduationStatus(req, res) {
        try {
            const { id } = req.params;

            const student = await models.Student.findByPk(id);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'دانشجو یافت نشد'
                });
            }

            // تغییر وضعیت فارغ التحصیلی
            const newStatus = !student.isGraduated;
            await student.update({ isGraduated: newStatus });

            const studentResponse = student.toJSON();
            delete studentResponse.password;

            res.json({
                success: true,
                message: `وضعیت فارغ التحصیلی دانشجو ${newStatus ? 'فعال' : 'غیرفعال'} شد`,
                data: studentResponse
            });

        } catch (error) {
            console.error('خطا در تغییر وضعیت فارغ التحصیلی:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در تغییر وضعیت فارغ التحصیلی',
                error: error.message
            });
        }
    }

    // DELETE - حذف دانشجو
    async deleteStudent(req, res) {
        try {
            const { id } = req.params;

            const student = await models.Student.findByPk(id);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'دانشجو یافت نشد'
                });
            }

            // حذف دانشجو
            await student.destroy();

            res.json({
                success: true,
                message: 'دانشجو با موفقیت حذف شد'
            });

        } catch (error) {
            console.error('خطا در حذف دانشجو:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در حذف دانشجو',
                error: error.message
            });
        }
    }

    // SEARCH - جستجو در دانشجویان
    async searchStudents(req, res) {
        try {
            const { q, page = 1, limit = 10 } = req.query;

            if (!q) {
                return res.status(400).json({
                    success: false,
                    message: 'عبارت جستجو الزامی است'
                });
            }

            const whereClause = {
                [Op.or]: [
                    { firstName: { [Op.like]: `%${q}%` } },
                    { lastName: { [Op.like]: `%${q}%` } },
                    { phone: { [Op.like]: `%${q}%` } },
                    { nationalCode: { [Op.like]: `%${q}%` } },
                    { studentId: { [Op.like]: `%${q}%` } }
                ]
            };

            const offset = (page - 1) * limit;
            const students = await models.Student.findAndCountAll({
                where: whereClause,
                attributes: { exclude: ['password'] },
                order: [['studentId', 'ASC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json({
                success: true,
                message: 'نتایج جستجو با موفقیت دریافت شدند',
                data: {
                    students: students.rows,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(students.count / limit),
                        totalItems: students.count,
                        itemsPerPage: parseInt(limit)
                    }
                }
            });

        } catch (error) {
            console.error('خطا در جستجوی دانشجویان:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در جستجوی دانشجویان',
                error: error.message
            });
        }
    }
}

module.exports = new StudentController();
