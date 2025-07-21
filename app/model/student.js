const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Student = sequelize.define('Student', {
        // آیدی داخلی اتو اینکریمنت
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            comment: 'آیدی داخلی اتو اینکریمنت که از 1 شروع می‌شود'
        },
        // شماره دانشجویی - عدد 10 رقمی که کاربر وارد می‌کند
        studentId: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true,
            field: 'student_id',
            comment: 'شماره دانشجویی 10 رقمی که کاربر وارد می‌کند',
            validate: {
                len: [10, 10],
                isNumeric: true
            }
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
                is: /^( 2B98|0)?9\d{9}$/ // فرمت شماره تلفن ایرانی
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
                len: [10, 10],
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
        timestamps: true,
        indexes: [
            { unique: true, fields: ['student_id'] },
            { unique: true, fields: ['phone'] },
            { unique: true, fields: ['national_code'] }
        ],
        hooks: {
        }
    });

    return Student;
};
