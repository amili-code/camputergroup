const { models, sequelize } = require('../config/models');
const { Op } = require('sequelize');

class CourseController {
    // CREATE - ایجاد دوره جدید
    async createCourse(req, res) {
        try {
            // console.log()
            const courseData = req.body;
            // فقط عنوان، نوع و قیمت اجباری است
            if (!courseData.title || !courseData.type || courseData.price === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'عنوان، نوع و قیمت دوره الزامی است'
                });
            }
            // اعتبارسنجی نوع
            if (!['course', 'event', 'competition'].includes(courseData.type)) {
                return res.status(400).json({
                    success: false,
                    message: 'نوع باید یکی از course، event یا competition باشد'
                });
            }
            // اطمینان از اینتیجر بودن قیمت
            courseData.price = parseInt(courseData.price, 10) || 0;

            // suitableFor: اگر نبود، همه ۱ باشد
            if (!courseData.suitableFor) {
                courseData.suitableFor = '111111111111';
            }
            // اعتبارسنجی suitableFor
            if (!/^[01]{12}$/.test(courseData.suitableFor)) {
                return res.status(400).json({
                    success: false,
                    message: 'فیلد suitableFor باید دقیقا ۱۲ رقم ۰ یا ۱ باشد'
                });
            }

            // اعتبارسنجی تگ‌ها (حداکثر ۳ تگ، جدا شده با کاما)
            if (courseData.tags) {
                const tagsArr = courseData.tags.split(',').map(t => t.trim()).filter(Boolean);
                if (tagsArr.length > 3) {
                    return res.status(400).json({
                        success: false,
                        message: 'حداکثر ۳ تگ مجاز است.'
                    });
                }
                courseData.tags = tagsArr.join(',');
            }

            // تاریخ اتمام: فقط به صورت رشته شمسی ذخیره شود (در فرانت باید شمسی باشد)
            if (courseData.endDate && typeof courseData.endDate !== 'string') {
                courseData.endDate = String(courseData.endDate);
            }

            // اگر دوره در دسترس نیست، بررسی علت
            if (courseData.isAvailable === false && !courseData.unavailabilityReason) {
                return res.status(400).json({
                    success: false,
                    message: 'در صورت عدم دسترسی، علت آن الزامی است'
                });
            }

            // location: اگر خالی باشد یعنی مجازی است
            if (!courseData.location) {
                courseData.location = null;
            }

            const course = await models.Course.create(courseData);
            
            res.status(201).json({
                success: true,
                message: 'دوره با موفقیت ایجاد شد',
                data: course
            });
        } catch (error) {
            console.error('خطا در ایجاد دوره:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در ایجاد دوره',
                error: error.message
            });
        }
    }

    // READ - دریافت تمام دوره‌ها
    async getAllCourses(req, res) {
        try {
            const courses = await models.Course.findAll({
                order: [['createdAt', 'DESC']]
            });
            
            res.json({
                success: true,
                data: courses
            });
        } catch (error) {
            console.error('خطا در دریافت دوره‌ها:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت دوره‌ها',
                error: error.message
            });
        }
    }

    // READ - دریافت دوره بر اساس ID
    async getCourseById(req, res) {
        try {
            const { id } = req.params;
            const course = await models.Course.findByPk(id);
            
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'دوره مورد نظر یافت نشد'
                });
            }
            
            res.json({
                success: true,
                data: course
            });
        } catch (error) {
            console.error('خطا در دریافت دوره:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت دوره',
                error: error.message
            });
        }
    }

    // READ - دریافت دوره‌های در دسترس
    async getAvailableCourses(req, res) {
        try {
            const courses = await models.Course.findAll({
                where: { isAvailable: true },
                order: [['createdAt', 'DESC']]
            });
            
            res.json({
                success: true,
                data: courses
            });
        } catch (error) {
            console.error('خطا در دریافت دوره‌های در دسترس:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت دوره‌های در دسترس',
                error: error.message
            });
        }
    }

    // READ - دریافت دوره‌های غیرفعال
    async getUnavailableCourses(req, res) {
        try {
            const courses = await models.Course.findAll({
                where: { isAvailable: false },
                order: [['createdAt', 'DESC']]
            });
            
            res.json({
                success: true,
                data: courses
            });
        } catch (error) {
            console.error('خطا در دریافت دوره‌های غیرفعال:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت دوره‌های غیرفعال',
                error: error.message
            });
        }
    }

    // UPDATE - بروزرسانی دوره
    async updateCourse(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const course = await models.Course.findByPk(id);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'دوره مورد نظر یافت نشد'
                });
            }
            // suitableFor: اگر نبود، همه ۱ باشد
            if (!updateData.suitableFor) {
                updateData.suitableFor = '111111111111';
            }
            // اعتبارسنجی suitableFor
            if (!/^[01]{12}$/.test(updateData.suitableFor)) {
                return res.status(400).json({
                    success: false,
                    message: 'فیلد suitableFor باید دقیقا ۱۲ رقم ۰ یا ۱ باشد'
                });
            }
            // اعتبارسنجی نوع
            if (updateData.type && !['course', 'event', 'competition'].includes(updateData.type)) {
                return res.status(400).json({
                    success: false,
                    message: 'نوع باید یکی از course، event یا competition باشد'
                });
            }
            // اطمینان از اینتیجر بودن قیمت
            if (updateData.price !== undefined) {
                updateData.price = parseInt(updateData.price, 10) || 0;
            }
            // اعتبارسنجی تگ‌ها (حداکثر ۳ تگ، جدا شده با کاما)
            if (updateData.tags) {
                const tagsArr = updateData.tags.split(',').map(t => t.trim()).filter(Boolean);
                if (tagsArr.length > 3) {
                    return res.status(400).json({
                        success: false,
                        message: 'حداکثر ۳ تگ مجاز است.'
                    });
                }
                updateData.tags = tagsArr.join(',');
            }
            // تاریخ اتمام: فقط به صورت رشته شمسی ذخیره شود
            if (updateData.endDate && typeof updateData.endDate !== 'string') {
                updateData.endDate = String(updateData.endDate);
            }
            // اگر دوره در دسترس نیست، بررسی علت
            if (updateData.isAvailable === false && !updateData.unavailabilityReason) {
                return res.status(400).json({
                    success: false,
                    message: 'در صورت عدم دسترسی، علت آن الزامی است'
                });
            }
            // location: اگر خالی باشد یعنی مجازی است
            if (updateData.location === '') {
                updateData.location = null;
            }
            await course.update(updateData);
            
            res.json({
                success: true,
                message: 'دوره با موفقیت بروزرسانی شد',
                data: course
            });
        } catch (error) {
            console.error('خطا در بروزرسانی دوره:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در بروزرسانی دوره',
                error: error.message
            });
        }
    }

    // UPDATE - تغییر وضعیت دسترسی دوره
    async toggleAvailability(req, res) {
        try {
            const { id } = req.params;
            const { isAvailable, unavailabilityReason } = req.body;
            
            const course = await models.Course.findByPk(id);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'دوره مورد نظر یافت نشد'
                });
            }

            // اگر دوره غیرفعال می‌شود، بررسی علت
            if (isAvailable === false && !unavailabilityReason) {
                return res.status(400).json({
                    success: false,
                    message: 'در صورت عدم دسترسی، علت آن الزامی است'
                });
            }

            await course.update({
                isAvailable,
                unavailabilityReason: isAvailable ? null : unavailabilityReason
            });
            
            res.json({
                success: true,
                message: `وضعیت دسترسی دوره ${isAvailable ? 'فعال' : 'غیرفعال'} شد`,
                data: course
            });
        } catch (error) {
            console.error('خطا در تغییر وضعیت دسترسی دوره:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در تغییر وضعیت دسترسی دوره',
                error: error.message
            });
        }
    }

    // DELETE - حذف دوره
    async deleteCourse(req, res) {
        try {
            const { id } = req.params;
            const course = await models.Course.findByPk(id);
            
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'دوره مورد نظر یافت نشد'
                });
            }

            await course.destroy();
            
            res.json({
                success: true,
                message: 'دوره با موفقیت حذف شد'
            });
        } catch (error) {
            console.error('خطا در حذف دوره:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در حذف دوره',
                error: error.message
            });
        }
    }

    // SEARCH - جستجو در دوره‌ها
    async searchCourses(req, res) {
        try {
            const { query, type, isAvailable, minPrice, maxPrice } = req.query;
            
            let whereClause = {};
            
            // جستجو در عنوان و توضیحات
            if (query) {
                whereClause[Op.or] = [
                    { title: { [Op.like]: `%${query}%` } },
                    { description: { [Op.like]: `%${query}%` } }
                ];
            }
            
            // فیلتر بر اساس نوع دوره
            if (type) {
                whereClause.type = type;
            }
            
            // فیلتر بر اساس وضعیت دسترسی
            if (isAvailable !== undefined) {
                whereClause.isAvailable = isAvailable === 'true';
            }
            
            // فیلتر بر اساس قیمت
            if (minPrice || maxPrice) {
                whereClause.price = {};
                if (minPrice) whereClause.price[Op.gte] = parseInt(minPrice, 10) || 0;
                if (maxPrice) whereClause.price[Op.lte] = parseInt(maxPrice, 10) || 0;
            }
            
            const courses = await models.Course.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']]
            });
            
            res.json({
                success: true,
                data: courses
            });
        } catch (error) {
            console.error('خطا در جستجوی دوره‌ها:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در جستجوی دوره‌ها',
                error: error.message
            });
        }
    }
}

module.exports = new CourseController();

