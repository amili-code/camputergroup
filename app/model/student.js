const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Student = sequelize.define('Student', {
        // شماره دانشجویی - شروع از 5000 و افزایش خودکار
        studentId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            unique: true,
            field: 'student_id',
            comment: 'شماره دانشجویی - شروع از 5000'
        },
        
        // نام
        firstName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'first_name',
            comment: 'نام دانشجو'
        },
        
        // نام خانوادگی
        lastName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'last_name',
            comment: 'نام خانوادگی دانشجو'
        },
        
        // رمز عبور
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'password',
            comment: 'رمز عبور دانشجو'
        },
        
        // شماره تلفن
        phone: {
            type: DataTypes.STRING(15),
            allowNull: false,
            unique: true,
            field: 'phone',
            comment: 'شماره تلفن دانشجو',
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
            comment: 'کد ملی دانشجو',
            validate: {
                len: [10, 10], // دقیقاً 10 رقم
                isNumeric: true
            }
        },
        
        // وضعیت فارغ التحصیلی
        isGraduated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_graduated',
            comment: 'آیا دانشجو فارغ التحصیل است؟'
        }
    }, {
        tableName: 'students',
        timestamps: true, // createdAt و updatedAt
        indexes: [
            {
                unique: true,
                fields: ['student_id']
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
            // تنظیم شماره دانشجویی شروع از 5000
            beforeCreate: async (student) => {
                const lastStudent = await sequelize.models.Student.findOne({
                    order: [['studentId', 'DESC']]
                });
                
                if (!lastStudent) {
                    student.studentId = 5000;
                } else {
                    student.studentId = lastStudent.studentId + 1;
                }
            }
        }
    });

    return Student;
};
