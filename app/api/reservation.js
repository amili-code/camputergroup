const { models } = require('../config/models');
const { logUserAction } = require('../config/loger');
const { Op } = require('sequelize');

class ReservationController {
    
    // CREATE - ایجاد درخواست رزرو جدید
    async createReservation(req, res) {
        try {
            const { studentId, teacherId, requestedTimeSlot, description } = req.body;
            
            // بررسی وجود دانشجو
            const student = await models.Student.findByPk(studentId);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'دانشجو مورد نظر یافت نشد'
                });
            }
            
            // بررسی وجود استاد
            const teacher = await models.Teacher.findByPk(teacherId);
            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: 'استاد مورد نظر یافت نشد'
                });
            }
            
            // بررسی اینکه آیا استاد در آن بازه زمانی در دسترس است
            const weeklySchedule = teacher.weeklySchedule;
            if (weeklySchedule[requestedTimeSlot] === '0') {
                return res.status(400).json({
                    success: false,
                    message: 'استاد در این بازه زمانی در دسترس نیست'
                });
            }
            
            // بررسی اینکه آیا قبلاً رزرو تایید شده‌ای برای این استاد در این بازه وجود دارد
            const existingApprovedReservation = await models.Reservation.findOne({
                where: {
                    teacherId,
                    requestedTimeSlot,
                    status: 'approved'
                }
            });
            
            if (existingApprovedReservation) {
                return res.status(400).json({
                    success: false,
                    message: 'این بازه زمانی قبلاً رزرو شده است'
                });
            }
            
            // بررسی اینکه آیا این دانشجو قبلاً برای این استاد در این بازه درخواست داده است
            const existingStudentReservation = await models.Reservation.findOne({
                where: {
                    studentId,
                    teacherId,
                    requestedTimeSlot,
                    status: ['pending', 'approved']
                }
            });
            
            if (existingStudentReservation) {
                return res.status(400).json({
                    success: false,
                    message: 'شما قبلاً برای این استاد در این بازه زمانی درخواست داده‌اید'
                });
            }
            
            // ایجاد رزرو جدید
            const reservation = await models.Reservation.create({
                studentId,
                teacherId,
                requestedTimeSlot,
                description,
                status: 'pending'
            });
            
            const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : `آیدی ${teacherId}`;
            await logUserAction(studentId, 'student', `درخواست رزرو وقت برای استاد ${teacherName} ثبت شد.`);
            
            // دریافت اطلاعات کامل رزرو
            const fullReservation = await models.Reservation.findByPk(reservation.id, {
                include: [
                    { model: models.Student, attributes: ['id', 'studentId', 'firstName', 'lastName'] },
                    { model: models.Teacher, attributes: ['id', 'teacherId', 'firstName', 'lastName'] }
                ]
            });
            
            res.status(201).json({
                success: true,
                message: 'درخواست رزرو با موفقیت ایجاد شد',
                data: fullReservation
            });
            
        } catch (error) {
            console.error('خطا در ایجاد رزرو:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در ایجاد درخواست رزرو',
                error: error.message
            });
        }
    }
    
    // READ - دریافت تمام رزروها
    async getAllReservations(req, res) {
        try {
            const { status, studentId, teacherId, page = 1, limit = 10 } = req.query;
            
            const where = {};
            if (status) where.status = status;
            if (studentId) where.studentId = studentId;
            if (teacherId) where.teacherId = teacherId;
            
            const offset = (page - 1) * limit;
            
            const reservations = await models.Reservation.findAndCountAll({
                where,
                include: [
                    { model: models.Student, attributes: ['id', 'studentId', 'firstName', 'lastName'] },
                    { model: models.Teacher, attributes: ['id', 'teacherId', 'firstName', 'lastName'] }
                ],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
            
            res.json({
                success: true,
                data: reservations.rows,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(reservations.count / limit),
                    totalItems: reservations.count,
                    itemsPerPage: parseInt(limit)
                }
            });
            
        } catch (error) {
            console.error('خطا در دریافت رزروها:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت رزروها',
                error: error.message
            });
        }
    }
    
    // READ - دریافت رزرو بر اساس ID
    async getReservationById(req, res) {
        try {
            const { id } = req.params;
            
            const reservation = await models.Reservation.findByPk(id, {
                include: [
                    { model: models.Student, attributes: ['id', 'studentId', 'firstName', 'lastName'] },
                    { model: models.Teacher, attributes: ['id', 'teacherId', 'firstName', 'lastName'] }
                ]
            });
            
            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message: 'رزرو مورد نظر یافت نشد'
                });
            }
            
            res.json({
                success: true,
                data: reservation
            });
            
        } catch (error) {
            console.error('خطا در دریافت رزرو:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت رزرو',
                error: error.message
            });
        }
    }
    
    // READ - دریافت رزروهای یک دانشجو
    async getStudentReservations(req, res) {
        try {
            const { studentId } = req.params;
            const { status, page = 1, limit = 10 } = req.query;
            
            const where = { studentId };
            if (status) where.status = status;
            
            const offset = (page - 1) * limit;
            
            const reservations = await models.Reservation.findAndCountAll({
                where,
                include: [
                    { model: models.Teacher, attributes: ['id', 'teacherId', 'firstName', 'lastName'] }
                ],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
            
            res.json({
                success: true,
                data: reservations.rows,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(reservations.count / limit),
                    totalItems: reservations.count,
                    itemsPerPage: parseInt(limit)
                }
            });
            
        } catch (error) {
            console.error('خطا در دریافت رزروهای دانشجو:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت رزروهای دانشجو',
                error: error.message
            });
        }
    }
    
    // READ - دریافت رزروهای یک استاد
    async getTeacherReservations(req, res) {
        try {
            const { teacherId } = req.params;
            const { status, page = 1, limit = 10 } = req.query;
            
            const where = { teacherId };
            if (status) where.status = status;
            
            const offset = (page - 1) * limit;
            
            const reservations = await models.Reservation.findAndCountAll({
                where,
                include: [
                    { model: models.Student, attributes: ['id', 'studentId', 'firstName', 'lastName'] }
                ],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
            
            // اضافه کردن اطلاعات روز و ساعت به هر رزرو
            const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
            const hours = ['8-10', '10-12', '12-14', '14-16', '16-18', '18-20'];
            
            const reservationsWithTimeInfo = reservations.rows.map(reservation => {
                const timeSlot = reservation.requestedTimeSlot;
                const day = Math.floor(timeSlot / 6);
                const hour = timeSlot % 6;
                
                return {
                    ...reservation.toJSON(),
                    dayName: days[day],
                    hourRange: hours[hour]
                };
            });
            
            res.json({
                success: true,
                data: reservationsWithTimeInfo,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(reservations.count / limit),
                    totalItems: reservations.count,
                    itemsPerPage: parseInt(limit)
                }
            });
            
        } catch (error) {
            console.error('خطا در دریافت رزروهای استاد:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت رزروهای استاد',
                error: error.message
            });
        }
    }
    
    // UPDATE - تایید رزرو
    async approveReservation(req, res) {
        try {
            const { id } = req.params;
            
            const reservation = await models.Reservation.findByPk(id);
            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message: 'رزرو مورد نظر یافت نشد'
                });
            }
            
            if (reservation.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'فقط رزروهای در انتظار قابل تایید هستند'
                });
            }
            
            // بررسی اینکه آیا بازه زمانی هنوز در دسترس است
            const teacher = await models.Teacher.findByPk(reservation.teacherId);
            if (teacher.weeklySchedule[reservation.requestedTimeSlot] === '0') {
                return res.status(400).json({
                    success: false,
                    message: 'استاد در این بازه زمانی در دسترس نیست'
                });
            }
            
            // بررسی اینکه آیا رزرو تایید شده دیگری در این بازه وجود دارد
            const existingApproved = await models.Reservation.findOne({
                where: {
                    teacherId: reservation.teacherId,
                    requestedTimeSlot: reservation.requestedTimeSlot,
                    status: 'approved',
                    id: { [Op.ne]: id }
                }
            });
            
            if (existingApproved) {
                return res.status(400).json({
                    success: false,
                    message: 'این بازه زمانی قبلاً رزرو شده است'
                });
            }
            
            // بروزرسانی وضعیت رزرو به تایید شده
            await reservation.update({ status: 'approved' });
            
            // بروزرسانی برنامه هفتگی استاد - تغییر بازه زمانی از 1 به 0
            const weeklySchedule = teacher.weeklySchedule;
            const updatedSchedule = weeklySchedule.split('');
            updatedSchedule[reservation.requestedTimeSlot] = '0';
            await teacher.update({ weeklySchedule: updatedSchedule.join('') });
            
            // ثبت لاگ برای دانشجو و دبیر
            await logUserAction(reservation.studentId, 'student', `درخواست رزرو شما توسط استاد تایید شد.`);
            await logUserAction(reservation.teacherId, 'teacher', `درخواست رزرو جدید تایید شد.`);
            
            const updatedReservation = await models.Reservation.findByPk(id, {
                include: [
                    { model: models.Student, attributes: ['id', 'studentId', 'firstName', 'lastName'] },
                    { model: models.Teacher, attributes: ['id', 'teacherId', 'firstName', 'lastName'] }
                ]
            });
            
            res.json({
                success: true,
                message: 'رزرو با موفقیت تایید شد',
                data: updatedReservation
            });
            
        } catch (error) {
            console.error('خطا در تایید رزرو:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در تایید رزرو',
                error: error.message
            });
        }
    }
    
    // UPDATE - رد رزرو
    async rejectReservation(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            
            const reservation = await models.Reservation.findByPk(id);
            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message: 'رزرو مورد نظر یافت نشد'
                });
            }
            
            if (reservation.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'فقط رزروهای در انتظار قابل رد هستند'
                });
            }
            
            await reservation.update({ 
                status: 'rejected',
                description: reason ? `${reservation.description}\n\nدلیل رد: ${reason}` : reservation.description
            });
            
            // ثبت لاگ برای دانشجو و دبیر
            await logUserAction(reservation.studentId, 'student', `درخواست رزرو شما توسط استاد رد شد.`);
            await logUserAction(reservation.teacherId, 'teacher', `درخواست رزرو جدید رد شد.`);
            
            const updatedReservation = await models.Reservation.findByPk(id, {
                include: [
                    { model: models.Student, attributes: ['id', 'studentId', 'firstName', 'lastName'] },
                    { model: models.Teacher, attributes: ['id', 'teacherId', 'firstName', 'lastName'] }
                ]
            });
            
            res.json({
                success: true,
                message: 'رزرو با موفقیت رد شد',
                data: updatedReservation
            });
            
        } catch (error) {
            console.error('خطا در رد رزرو:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در رد رزرو',
                error: error.message
            });
        }
    }
    
    // UPDATE - لغو رزرو
    async cancelReservation(req, res) {
        try {
            const { id } = req.params;
            
            const reservation = await models.Reservation.findByPk(id);
            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message: 'رزرو مورد نظر یافت نشد'
                });
            }
            
            if (reservation.status === 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'این رزرو قبلاً لغو شده است'
                });
            }
            
            // اگر رزرو تایید شده بود، بازه زمانی را دوباره آزاد کن
            if (reservation.status === 'approved') {
                const teacher = await models.Teacher.findByPk(reservation.teacherId);
                if (teacher) {
                    const weeklySchedule = teacher.weeklySchedule;
                    const updatedSchedule = weeklySchedule.split('');
                    updatedSchedule[reservation.requestedTimeSlot] = '1';
                    await teacher.update({ weeklySchedule: updatedSchedule.join('') });
                }
            }
            
            await reservation.update({ status: 'cancelled' });
            
            const updatedReservation = await models.Reservation.findByPk(id, {
                include: [
                    { model: models.Student, attributes: ['id', 'studentId', 'firstName', 'lastName'] },
                    { model: models.Teacher, attributes: ['id', 'teacherId', 'firstName', 'lastName'] }
                ]
            });
            
            res.json({
                success: true,
                message: 'رزرو با موفقیت لغو شد',
                data: updatedReservation
            });
            
        } catch (error) {
            console.error('خطا در لغو رزرو:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در لغو رزرو',
                error: error.message
            });
        }
    }
    
    // UPDATE - بروزرسانی رزرو
    async updateReservation(req, res) {
        try {
            const { id } = req.params;
            const { requestedTimeSlot, description } = req.body;
            
            const reservation = await models.Reservation.findByPk(id);
            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message: 'رزرو مورد نظر یافت نشد'
                });
            }
            
            if (reservation.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'فقط رزروهای در انتظار قابل ویرایش هستند'
                });
            }
            
            // اگر بازه زمانی تغییر کرده، بررسی در دسترس بودن
            if (requestedTimeSlot && requestedTimeSlot !== reservation.requestedTimeSlot) {
                const teacher = await models.Teacher.findByPk(reservation.teacherId);
                if (teacher.weeklySchedule[requestedTimeSlot] === '0') {
                    return res.status(400).json({
                        success: false,
                        message: 'استاد در این بازه زمانی در دسترس نیست'
                    });
                }
                
                // بررسی رزرو تایید شده در بازه جدید
                const existingApproved = await models.Reservation.findOne({
                    where: {
                        teacherId: reservation.teacherId,
                        requestedTimeSlot,
                        status: 'approved'
                    }
                });
                
                if (existingApproved) {
                    return res.status(400).json({
                        success: false,
                        message: 'این بازه زمانی قبلاً رزرو شده است'
                    });
                }
            }
            
            await reservation.update({
                requestedTimeSlot: requestedTimeSlot || reservation.requestedTimeSlot,
                description: description || reservation.description
            });
            
            const updatedReservation = await models.Reservation.findByPk(id, {
                include: [
                    { model: models.Student, attributes: ['id', 'studentId', 'firstName', 'lastName'] },
                    { model: models.Teacher, attributes: ['id', 'teacherId', 'firstName', 'lastName'] }
                ]
            });
            
            res.json({
                success: true,
                message: 'رزرو با موفقیت بروزرسانی شد',
                data: updatedReservation
            });
            
        } catch (error) {
            console.error('خطا در بروزرسانی رزرو:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در بروزرسانی رزرو',
                error: error.message
            });
        }
    }
    
    // DELETE - حذف رزرو
    async deleteReservation(req, res) {
        try {
            const { id } = req.params;
            
            const reservation = await models.Reservation.findByPk(id);
            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message: 'رزرو مورد نظر یافت نشد'
                });
            }
            
            await reservation.destroy();
            
            res.json({
                success: true,
                message: 'رزرو با موفقیت حذف شد'
            });
            
        } catch (error) {
            console.error('خطا در حذف رزرو:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در حذف رزرو',
                error: error.message
            });
        }
    }
    
    // READ - دریافت آمار رزروها
    async getReservationStats(req, res) {
        try {
            const stats = await models.Reservation.findAll({
                attributes: [
                    'status',
                    [models.Sequelize.fn('COUNT', models.Sequelize.col('id')), 'count']
                ],
                group: ['status']
            });
            
            const totalReservations = await models.Reservation.count();
            
            res.json({
                success: true,
                data: {
                    total: totalReservations,
                    byStatus: stats
                }
            });
            
        } catch (error) {
            console.error('خطا در دریافت آمار رزروها:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت آمار رزروها',
                error: error.message
            });
        }
    }
}

module.exports = new ReservationController();