const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Teacher = sequelize.define('Teacher', {
        // کد پرسنلی - شروع از 100 و افزایش خودکار
        teacherId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            unique: true,
            field: 'teacher_id',
            comment: 'کد پرسنلی استاد - شروع از 100'
        },
        
        // نام
        firstName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'first_name',
            comment: 'نام استاد'
        },
        
        // نام خانوادگی
        lastName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'last_name',
            comment: 'نام خانوادگی استاد'
        },
        
        // عکس پرسنلی
        personalImage: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'personal_image',
            comment: 'مسیر عکس پرسنلی استاد'
        },
        
        // شماره تلفن
        phone: {
            type: DataTypes.STRING(15),
            allowNull: false,
            unique: true,
            field: 'phone',
            comment: 'شماره تلفن استاد',
            validate: {
                is: /^(\+98|0)?9\d{9}$/ // فرمت شماره تلفن ایرانی
            }
        },
        
        // کد ملی
        nationalCode: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true,
            field: 'national_code',
            comment: 'کد ملی استاد',
            validate: {
                len: [10, 10], // دقیقاً 10 رقم
                isNumeric: true
            }
        },
        
        // برنامه هفتگی - 42 رقم 0 و 1 (6 بازه زمانی × 7 روز)
        weeklySchedule: {
            type: DataTypes.STRING(42),
            allowNull: false,
            defaultValue: '000000000000000000000000000000000000000000',
            field: 'weekly_schedule',
            comment: 'برنامه هفتگی استاد - 42 رقم 0 و 1 (6 بازه × 7 روز)',
            validate: {
                is: /^[01]{42}$/, // دقیقاً 42 رقم 0 یا 1
                len: [42, 42]
            }
        }
    }, {
        tableName: 'teachers',
        timestamps: true, // createdAt و updatedAt
        indexes: [
            {
                unique: true,
                fields: ['teacher_id']
            },
            {
                unique: true,
                fields: ['phone']
            },
            {
                unique: true,
                fields: ['national_code']
            }
        ],
        hooks: {
            // تنظیم کد پرسنلی شروع از 100
            beforeCreate: async (teacher) => {
                const lastTeacher = await sequelize.models.Teacher.findOne({
                    order: [['teacherId', 'DESC']]
                });
                
                if (!lastTeacher) {
                    teacher.teacherId = 100;
                } else {
                    teacher.teacherId = lastTeacher.teacherId + 1;
                }
            }
        }
    });

    return Teacher;
};
