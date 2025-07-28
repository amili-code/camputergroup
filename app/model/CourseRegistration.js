const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const CourseRegistration = sequelize.define('CourseRegistration', {
        // آیدی داخلی اتو اینکریمنت
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            comment: 'آیدی داخلی اتو اینکریمنت'
        },
        // آیدی دانشجو (کلید خارجی)
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'student_id',
            comment: 'آیدی دانشجو (کلید خارجی)',
            references: {
                model: 'students',
                key: 'id'
            }
        },
        // آیدی دوره (کلید خارجی)
        courseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'course_id',
            comment: 'آیدی دوره (کلید خارجی)',
            references: {
                model: 'courses',
                key: 'id'
            }
        },
        // وضعیت تایید (pending, approved, rejected)
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending',
            comment: 'وضعیت تایید: در انتظار، تایید شده، رد شده'
        },
        // تاریخ درخواست
        requestDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'request_date',
            comment: 'تاریخ درخواست ثبت نام'
        },
        // تاریخ تایید/رد
        approvalDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'approval_date',
            comment: 'تاریخ تایید یا رد درخواست'
        },
        // توضیحات (برای رد کردن یا تایید)
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'توضیحات مربوط به تایید یا رد درخواست'
        }
    }, {
        tableName: 'course_registrations',
        timestamps: true,
        indexes: [
            { unique: true, fields: ['student_id', 'course_id'] }, // هر دانشجو فقط یک بار می‌تواند برای هر دوره درخواست دهد
            { fields: ['status'] }, // برای جستجوی سریع بر اساس وضعیت
            { fields: ['request_date'] }, // برای مرتب‌سازی بر اساس تاریخ
            { fields: ['student_id'] }, // برای جستجوی درخواست‌های یک دانشجو
            { fields: ['course_id'] } // برای جستجوی درخواست‌های یک دوره
        ],
        comment: 'جدول درخواست‌های ثبت نام در دوره‌ها'
    });

    return CourseRegistration;
};