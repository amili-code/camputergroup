const { models, sequelize } = require('../config/models');
const { logUserAction } = require('../config/loger');

class StudentMetaController {
    // CREATE - ایجاد اطلاعات متا برای دانشجو
    async createStudentMeta(req, res) {
        try {
            const { studentId, socialLinks, introduction, skills } = req.body;

            // بررسی وجود دانشجو
            const student = await models.Student.findByPk(studentId);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'دانشجو یافت نشد'
                });
            }

            // بررسی اینکه دانشجو فارغ التحصیل است
            if (!student.isGraduated) {
                return res.status(400).json({
                    success: false,
                    message: 'فقط دانشجویان فارغ التحصیل می‌توانند اطلاعات متا داشته باشند'
                });
            }

            // بررسی وجود قبلی
            const existingMeta = await models.StudentMeta.findOne({ where: { studentId } });
            if (existingMeta) {
                return res.status(400).json({
                    success: false,
                    message: 'اطلاعات متا برای این دانشجو قبلاً وجود دارد'
                });
            }

            // ایجاد اطلاعات متا
            const studentMeta = await models.StudentMeta.create({
                studentId,
                socialLinks,
                introduction,
                skills
            });

            // ثبت لاگ
            await logUserAction(req, `اطلاعات متا برای دانشجو "${student.firstName} ${student.lastName}" ثبت کرد`);

            res.status(201).json({
                success: true,
                message: 'اطلاعات متا با موفقیت ایجاد شد',
                data: studentMeta
            });

        } catch (error) {
            console.error('خطا در ایجاد اطلاعات متا:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در ایجاد اطلاعات متا',
                error: error.message
            });
        }
    }

    // READ - دریافت اطلاعات متا بر اساس آیدی دانشجو
    async getStudentMetaByStudentId(req, res) {
        try {
            const { studentId } = req.params;

            const studentMeta = await models.StudentMeta.findOne({
                where: { studentId },
                include: [{
                    model: models.Student,
                    as: 'Student',
                    attributes: ['id', 'firstName', 'lastName', 'studentId', 'isGraduated']
                }]
            });

            if (!studentMeta) {
                return res.status(404).json({
                    success: false,
                    message: 'اطلاعات متا یافت نشد'
                });
            }

            res.json({
                success: true,
                message: 'اطلاعات متا با موفقیت دریافت شد',
                data: studentMeta
            });

        } catch (error) {
            console.error('خطا در دریافت اطلاعات متا:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت اطلاعات متا',
                error: error.message
            });
        }
    }

    // READ - دریافت تمام اطلاعات متا
    async getAllStudentMeta(req, res) {
        try {
            const studentMeta = await models.StudentMeta.findAll({
                include: [{
                    model: models.Student,
                    as: 'Student',
                    attributes: ['id', 'firstName', 'lastName', 'studentId', 'isGraduated']
                }],
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                message: 'تمام اطلاعات متا با موفقیت دریافت شد',
                data: studentMeta
            });

        } catch (error) {
            console.error('خطا در دریافت اطلاعات متا:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت اطلاعات متا',
                error: error.message
            });
        }
    }

    // UPDATE - بروزرسانی اطلاعات متا
    async updateStudentMeta(req, res) {
        try {
            const { id } = req.params;
            const { socialLinks, introduction, skills } = req.body;

            // بررسی احراز هویت کاربر
            if (!req.session || !req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: 'لطفاً ابتدا وارد شوید'
                });
            }

            const studentMeta = await models.StudentMeta.findByPk(id, {
                include: [{
                    model: models.Student,
                    as: 'Student',
                    attributes: ['id', 'firstName', 'lastName', 'studentId', 'isGraduated']
                }]
            });

            if (!studentMeta) {
                return res.status(404).json({
                    success: false,
                    message: 'اطلاعات متا یافت نشد'
                });
            }

            // بررسی اینکه کاربر فقط اطلاعات خودش را ویرایش کند
            if (studentMeta.studentId !== req.session.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'شما فقط می‌توانید اطلاعات خودتان را ویرایش کنید'
                });
            }

            // بررسی اینکه دانشجو فارغ التحصیل است
            if (!studentMeta.Student.isGraduated) {
                return res.status(403).json({
                    success: false,
                    message: 'فقط دانشجویان فارغ التحصیل می‌توانند اطلاعات متا ویرایش کنند'
                });
            }

            // بروزرسانی اطلاعات
            const updateData = {};
            if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
            if (introduction !== undefined) updateData.introduction = introduction;
            if (skills !== undefined) updateData.skills = skills;

            await studentMeta.update(updateData);

            // ثبت لاگ
            await logUserAction(req, `اطلاعات متا خود را ویرایش کرد`);

            res.json({
                success: true,
                message: 'اطلاعات متا با موفقیت بروزرسانی شد',
                data: studentMeta
            });

        } catch (error) {
            console.error('خطا در بروزرسانی اطلاعات متا:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در بروزرسانی اطلاعات متا',
                error: error.message
            });
        }
    }

    // DELETE - حذف اطلاعات متا
    async deleteStudentMeta(req, res) {
        try {
            const { id } = req.params;

            // بررسی احراز هویت کاربر
            if (!req.session || !req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: 'لطفاً ابتدا وارد شوید'
                });
            }

            const studentMeta = await models.StudentMeta.findByPk(id, {
                include: [{
                    model: models.Student,
                    as: 'Student',
                    attributes: ['id', 'isGraduated']
                }]
            });

            if (!studentMeta) {
                return res.status(404).json({
                    success: false,
                    message: 'اطلاعات متا یافت نشد'
                });
            }

            // بررسی اینکه کاربر فقط اطلاعات خودش را حذف کند
            if (studentMeta.studentId !== req.session.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'شما فقط می‌توانید اطلاعات خودتان را حذف کنید'
                });
            }

            // بررسی اینکه دانشجو فارغ التحصیل است
            if (!studentMeta.Student.isGraduated) {
                return res.status(403).json({
                    success: false,
                    message: 'فقط دانشجویان فارغ التحصیل می‌توانند اطلاعات متا حذف کنند'
                });
            }

            await studentMeta.destroy();

            // ثبت لاگ
            await logUserAction(req, `اطلاعات متا خود را حذف کرد`);

            res.json({
                success: true,
                message: 'اطلاعات متا با موفقیت حذف شد'
            });

        } catch (error) {
            console.error('خطا در حذف اطلاعات متا:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در حذف اطلاعات متا',
                error: error.message
            });
        }
    }

    // READ - دریافت اطلاعات متا بر اساس آیدی خودش
    async getStudentMetaById(req, res) {
        try {
            const { id } = req.params;

            const studentMeta = await models.StudentMeta.findByPk(id, {
                include: [{
                    model: models.Student,
                    as: 'Student',
                    attributes: ['id', 'firstName', 'lastName', 'studentId', 'isGraduated']
                }]
            });

            if (!studentMeta) {
                return res.status(404).json({
                    success: false,
                    message: 'اطلاعات متا یافت نشد'
                });
            }

            res.json({
                success: true,
                message: 'اطلاعات متا با موفقیت دریافت شد',
                data: studentMeta
            });

        } catch (error) {
            console.error('خطا در دریافت اطلاعات متا:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت اطلاعات متا',
                error: error.message
            });
        }
    }
}

module.exports = new StudentMetaController(); 