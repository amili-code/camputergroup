const { models, sequelize } = require('../config/models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
class TeacherController {
    // CREATE - ایجاد استاد جدید
    async createTeacher(req, res) {
        try {
            const { firstName, lastName, phone, nationalCode, weeklySchedule, teacherId, password, teachingSubjects, description } = req.body;

            // اعتبارسنجی داده‌های ورودی
            if (!firstName || !lastName || !phone || !nationalCode || !teacherId) {
                return res.status(400).json({
                    success: false,
                    message: 'تمام فیلدهای اجباری باید پر شوند (شامل کد پرسنلی)'
                });
            }

            // اعتبارسنجی کد پرسنلی (باید عدد 10 رقمی باشد)
            if (!/^[0-9]{10}$/.test(teacherId)) {
                return res.status(400).json({
                    success: false,
                    message: 'کد پرسنلی باید یک عدد 10 رقمی باشد'
                });
            }

            // بررسی تکراری نبودن کد پرسنلی
            const existingTeacherId = await models.Teacher.findOne({ where: { teacherId } });
            if (existingTeacherId) {
                return res.status(400).json({
                    success: false,
                    message: 'این کد پرسنلی قبلاً ثبت شده است'
                });
            }

            // بررسی تکراری نبودن شماره تلفن
            const existingPhone = await models.Teacher.findOne({ where: { phone } });
            if (existingPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'این شماره تلفن قبلاً ثبت شده است'
                });
            }

            // بررسی تکراری نبودن کد ملی
            const existingNationalCode = await models.Teacher.findOne({ where: { nationalCode } });
            if (existingNationalCode) {
                return res.status(400).json({
                    success: false,
                    message: 'این کد ملی قبلاً ثبت شده است'
                });
            }

            // اعتبارسنجی برنامه هفتگی
            if (weeklySchedule && !/^[01]{42}$/.test(weeklySchedule)) {
                return res.status(400).json({
                    success: false,
                    message: 'برنامه هفتگی باید دقیقاً 42 رقم 0 یا 1 باشد (6 بازه × 7 روز)'
                });
            }

            // اعتبارسنجی دروس تدریس (حداکثر 5 درس)
            if (teachingSubjects) {
                const subjects = teachingSubjects.split(',').map(subject => subject.trim()).filter(subject => subject.length > 0);
                if (subjects.length > 5) {
                    return res.status(400).json({
                        success: false,
                        message: 'حداکثر 5 درس تدریس مجاز است'
                    });
                }
            }

            // پردازش تصویر آپلود شده
            let personalImagePath = null;
            if (req.file) {
                personalImagePath = `/pic/teachers/${req.file.filename}`;
            }
            
            // اگر پسورد خالی بود، کد ملی را به عنوان پسورد استفاده کن
            const passwordToUse = password || nationalCode;
            const hashedPassword = await bcrypt.hash(passwordToUse, 10);

            // ایجاد استاد جدید
            const teacher = await models.Teacher.create({
                teacherId,
                firstName,
                lastName,
                password: hashedPassword,
                personalImage: personalImagePath,
                phone,
                nationalCode,
                teachingSubjects: teachingSubjects || '',
                description: description || null,
                weeklySchedule: weeklySchedule || '000000000000000000000000000000000000000000'
            });

            res.status(201).json({
                success: true,
                message: 'استاد با موفقیت ایجاد شد',
                data: teacher
            });

        } catch (error) {
            console.error('خطا در ایجاد استاد:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در ایجاد استاد',
                error: error.message
            });
        }
    }

    // READ - دریافت تمام اساتید
    async getAllTeachers(req, res) {
        try {
            const { sortBy = 'teacherId', sortOrder = 'ASC' } = req.query;

            // تنظیمات مرتب‌سازی
            const order = [[sortBy, sortOrder.toUpperCase()]];

            // دریافت تمام اساتید بدون صفحه‌بندی
            const teachers = await models.Teacher.findAll({
                order
            });
            // بررسی نقش ادمین واقعی
            let isRealAdmin = false;
            if (req.session && req.session.admin && req.session.admin.role === 'admin') {
                const fs = require('fs');
                const path = require('path');
                const adminPath = path.join(__dirname, '../../scripts/admin.json');
                let adminData = JSON.parse(fs.readFileSync(adminPath, 'utf8'));
                if (req.session.admin.username === adminData.admin.username) {
                    isRealAdmin = true;
                }
            }
            // حذف رمز عبور و کد ملی از خروجی (مگر برای ادمین واقعی)
            const teachersSafe = teachers.map(t => {
                const obj = t.toJSON();
                delete obj.password;
                if (!isRealAdmin) delete obj.nationalCode;
                return obj;
            });

            res.json({
                success: true,
                message: 'اساتید با موفقیت دریافت شدند',
                data: teachersSafe
            });

        } catch (error) {
            console.error('خطا در دریافت اساتید:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت اساتید',
                error: error.message
            });
        }
    }

    // READ - دریافت استاد بر اساس ID
    async getTeacherById(req, res) {
        try {
            const { id } = req.params;

            const teacher = await models.Teacher.findByPk(id);

            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: 'استاد یافت نشد'
                });
            }
            // بررسی نقش ادمین واقعی
            let isRealAdmin = false;
            if (req.session && req.session.admin && req.session.admin.role === 'admin') {
                const fs = require('fs');
                const path = require('path');
                const adminPath = path.join(__dirname, '../../scripts/admin.json');
                let adminData = JSON.parse(fs.readFileSync(adminPath, 'utf8'));
                if (req.session.admin.username === adminData.admin.username) {
                    isRealAdmin = true;
                }
            }
            // حذف رمز عبور و کد ملی از خروجی (مگر برای ادمین واقعی)
            const teacherSafe = teacher.toJSON();
            delete teacherSafe.password;
            if (!isRealAdmin) delete teacherSafe.nationalCode;

            res.json({
                success: true,
                message: 'استاد با موفقیت دریافت شد',
                data: teacherSafe
            });

        } catch (error) {
            console.error('خطا در دریافت استاد:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت استاد',
                error: error.message
            });
        }
    }

    // UPDATE - بروزرسانی استاد
    async updateTeacher(req, res) {
        try {
            const { id } = req.params;
            const { firstName, lastName, phone, nationalCode, weeklySchedule, teacherId, personalImage, password, teachingSubjects, description } = req.body;

            // بررسی وجود استاد
            const teacher = await models.Teacher.findByPk(id);
            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: 'استاد یافت نشد'
                });
            }

            // بررسی تکراری نبودن کد پرسنلی (اگر تغییر کرده باشد)
            if (teacherId && teacherId !== teacher.teacherId) {
                if (!/^[0-9]{10}$/.test(teacherId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'کد پرسنلی باید یک عدد 10 رقمی باشد'
                    });
                }
                const existingTeacherId = await models.Teacher.findOne({ where: { teacherId } });
                if (existingTeacherId) {
                    return res.status(400).json({
                        success: false,
                        message: 'این کد پرسنلی قبلاً ثبت شده است'
                    });
                }
            }

            // بررسی تکراری نبودن شماره تلفن (اگر تغییر کرده باشد)
            if (phone && phone !== teacher.phone) {
                const existingPhone = await models.Teacher.findOne({ where: { phone } });
                if (existingPhone) {
                    return res.status(400).json({
                        success: false,
                        message: 'این شماره تلفن قبلاً ثبت شده است'
                    });
                }
            }

            // بررسی تکراری نبودن کد ملی (اگر تغییر کرده باشد)
            if (nationalCode && nationalCode !== teacher.nationalCode) {
                const existingNationalCode = await models.Teacher.findOne({ where: { nationalCode } });
                if (existingNationalCode) {
                    return res.status(400).json({
                        success: false,
                        message: 'این کد ملی قبلاً ثبت شده است'
                    });
                }
            }

            // اعتبارسنجی برنامه هفتگی
            if (weeklySchedule && !/^[01]{42}$/.test(weeklySchedule)) {
                return res.status(400).json({
                    success: false,
                    message: 'برنامه هفتگی باید دقیقاً 42 رقم 0 یا 1 باشد (6 بازه × 7 روز)'
                });
            }

            // اعتبارسنجی دروس تدریس (حداکثر 5 درس)
            if (teachingSubjects) {
                const subjects = teachingSubjects.split(',').map(subject => subject.trim()).filter(subject => subject.length > 0);
                if (subjects.length > 5) {
                    return res.status(400).json({
                        success: false,
                        message: 'حداکثر 5 درس تدریس مجاز است'
                    });
                }
            }

            // پردازش تصویر آپلود شده یا حذف تصویر
            let personalImagePath = teacher.personalImage; // نگه داشتن تصویر قبلی
            if (req.file) {
                // حذف تصویر قدیمی اگر وجود داشته باشد
                if (teacher.personalImage) {
                    try {
                        const oldImagePath = path.join(__dirname, '../../public', teacher.personalImage);
                        if (fs.existsSync(oldImagePath)) {
                            fs.unlinkSync(oldImagePath);
                        }
                    } catch (imageError) {
                        console.error('خطا در حذف تصویر قدیمی استاد:', imageError);
                        // ادامه عملیات حتی اگر حذف تصویر با خطا مواجه شود
                    }
                }
                personalImagePath = `/pic/teachers/${req.file.filename}`;
            }
            // اگر کاربر درخواست حذف تصویر داده بود (personalImage === '')
            if (personalImage === '') {
                if (teacher.personalImage) {
                    try {
                        const oldImagePath = path.join(__dirname, '../../public', teacher.personalImage);
                        if (fs.existsSync(oldImagePath)) {
                            fs.unlinkSync(oldImagePath);
                        }
                    } catch (imageError) {
                        console.error('خطا در حذف تصویر استاد:', imageError);
                    }
                }
                personalImagePath = null;
            }

            // آماده‌سازی داده‌های بروزرسانی
            const updateData = {};
            if (teacherId && teacherId !== teacher.teacherId) updateData.teacherId = teacherId;
            if (firstName) updateData.firstName = firstName;
            if (lastName) updateData.lastName = lastName;
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updateData.password = hashedPassword;
            }
            if (req.file || personalImage === '') updateData.personalImage = personalImagePath;
            if (phone) updateData.phone = phone;
            if (nationalCode) updateData.nationalCode = nationalCode;
            if (teachingSubjects !== undefined) updateData.teachingSubjects = teachingSubjects;
            if (description !== undefined) updateData.description = description;
            if (weeklySchedule) updateData.weeklySchedule = weeklySchedule;

            // بروزرسانی استاد
            await teacher.update(updateData);

            res.json({
                success: true,
                message: 'استاد با موفقیت بروزرسانی شد',
                data: teacher
            });

        } catch (error) {
            console.error('خطا در بروزرسانی استاد:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در بروزرسانی استاد',
                error: error.message
            });
        }
    }

    // DELETE - حذف استاد
    async deleteTeacher(req, res) {
        try {
            const { id } = req.params;

            const teacher = await models.Teacher.findByPk(id);
            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: 'استاد یافت نشد'
                });
            }

            // حذف تصویر پرسنلی اگر وجود داشته باشد
            if (teacher.personalImage) {
                try {
                    const imagePath = path.join(__dirname, '../../public', teacher.personalImage);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                } catch (imageError) {
                    console.error('خطا در حذف تصویر استاد:', imageError);
                    // ادامه عملیات حتی اگر حذف تصویر با خطا مواجه شود
                }
            }

            // حذف استاد
            await teacher.destroy();

            res.json({
                success: true,
                message: 'استاد با موفقیت حذف شد'
            });

        } catch (error) {
            console.error('خطا در حذف استاد:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در حذف استاد',
                error: error.message
            });
        }
    }

    // SEARCH - جستجو در اساتید
    async searchTeachers(req, res) {
        try {
            const { q } = req.query;

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
                    { teacherId: { [Op.like]: `%${q}%` } },
                    { teachingSubjects: { [Op.like]: `%${q}%` } },
                    { description: { [Op.like]: `%${q}%` } }
                ]
            };

            const teachers = await models.Teacher.findAll({
                where: whereClause,
                order: [['teacherId', 'ASC']]
            });

            res.json({
                success: true,
                message: 'نتایج جستجو با موفقیت دریافت شدند',
                data: teachers
            });

        } catch (error) {
            console.error('خطا در جستجوی اساتید:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در جستجوی اساتید',
                error: error.message
            });
        }
    }

    // دریافت اساتید بر اساس برنامه هفتگی
    async getTeachersBySchedule(req, res) {
        try {
            const { day, timeSlot } = req.query; // day: 0-6 (شنبه تا جمعه), timeSlot: 0-5 (6 بازه زمانی)

            if (day === undefined || day < 0 || day > 6) {
                return res.status(400).json({
                    success: false,
                    message: 'روز هفته باید بین 0 تا 6 باشد (شنبه=0 تا جمعه=6)'
                });
            }

            if (timeSlot === undefined || timeSlot < 0 || timeSlot > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'بازه زمانی باید بین 0 تا 5 باشد (0: 8-10, 1: 10-12, 2: 12-14, 3: 14-16, 4: 16-18, 5: 18-20)'
                });
            }

            // محاسبه موقعیت در رشته 42 رقمی
            const position = (day * 6) + timeSlot + 1; // +1 چون SQL از 1 شروع می‌شود

            const teachers = await models.Teacher.findAll({
                where: sequelize.literal(`SUBSTRING(weekly_schedule, ${position}, 1) = '1'`),
                order: [['teacherId', 'ASC']]
            });

            res.json({
                success: true,
                message: 'اساتید با برنامه هفتگی مشخص شده دریافت شدند',
                data: teachers
            });

        } catch (error) {
            console.error('خطا در دریافت اساتید بر اساس برنامه:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت اساتید بر اساس برنامه',
                error: error.message
            });
        }
    }

    // دریافت اساتید بر اساس درس تدریس
    async getTeachersBySubject(req, res) {
        try {
            const { subject } = req.query;

            if (!subject) {
                return res.status(400).json({
                    success: false,
                    message: 'نام درس الزامی است'
                });
            }

            const teachers = await models.Teacher.findAll({
                where: {
                    teachingSubjects: {
                        [Op.like]: `%${subject}%`
                    }
                },
                order: [['teacherId', 'ASC']]
            });

            res.json({
                success: true,
                message: 'اساتید با درس تدریس مشخص شده دریافت شدند',
                data: teachers
            });

        } catch (error) {
            console.error('خطا در دریافت اساتید بر اساس درس:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت اساتید بر اساس درس',
                error: error.message
            });
        }
    }
}

module.exports = new TeacherController(); 