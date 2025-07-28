const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Reservation = sequelize.define('Reservation', {
        // آیدی داخلی اتو اینکریمنت
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            comment: 'آیدی داخلی اتو اینکریمنت که از 1 شروع می‌شود'
        },
        
        // آیدی دانشجو (کلید خارجی)
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'student_id',
            comment: 'آیدی دانشجو که درخواست رزرو داده است',
            references: {
                model: 'students',
                key: 'id'
            }
        },
        
        // آیدی استاد (کلید خارجی)
        teacherId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'teacher_id',
            comment: 'آیدی استاد که درخواست رزرو برای او ارسال شده است',
            references: {
                model: 'teachers',
                key: 'id'
            }
        },
        
        // بازه زمانی درخواستی (0 تا 42)
        // 0 = یکشنبه بازه 1 (8-10)
        // 1 = یکشنبه بازه 2 (10-12)
        // ...
        // 41 = جمعه بازه 6 (18-20)
        requestedTimeSlot: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'requested_time_slot',
            comment: 'بازه زمانی درخواستی (0 تا 41) - 6 بازه × 7 روز',
            validate: {
                min: 0,
                max: 41
            }
        },
        
        // توضیحات درخواست
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description',
            comment: 'توضیحات دانشجو برای درخواست رزرو'
        },
        
        // وضعیت رزرو
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending',
            field: 'status',
            comment: 'وضعیت رزرو: در انتظار، تایید شده، رد شده، لغو شده'
        }
    }, {
        tableName: 'reservations',
        timestamps: true, // createdAt و updatedAt
        indexes: [
            { fields: ['student_id'] },
            { fields: ['teacher_id'] },
            { fields: ['status'] },
            { fields: ['requested_time_slot'] }
        ],
        hooks: {
            // بررسی اینکه آیا استاد در آن بازه زمانی در دسترس است
            beforeCreate: async (reservation, options) => {
                const teacher = await sequelize.models.Teacher.findByPk(reservation.teacherId);
                if (!teacher) {
                    throw new Error('استاد مورد نظر یافت نشد');
                }
                
                // بررسی اینکه آیا استاد در آن بازه زمانی در دسترس است
                const weeklySchedule = teacher.weeklySchedule;
                const timeSlotIndex = reservation.requestedTimeSlot;
                
                if (weeklySchedule[timeSlotIndex] === '0') {
                    throw new Error('استاد در این بازه زمانی در دسترس نیست');
                }
                
                // بررسی اینکه آیا قبلاً رزرو تایید شده‌ای برای این استاد در این بازه وجود دارد
                const existingReservation = await sequelize.models.Reservation.findOne({
                    where: {
                        teacherId: reservation.teacherId,
                        requestedTimeSlot: reservation.requestedTimeSlot,
                        status: 'approved'
                    }
                });
                
                if (existingReservation) {
                    throw new Error('این بازه زمانی قبلاً رزرو شده است');
                }
            }
        }
    });

    return Reservation;
};