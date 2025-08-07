const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'نام یا عنوان دوره'
    },
    endDate: {
        type: DataTypes.STRING(20), // تاریخ شمسی به صورت رشته
        allowNull: true,
        comment: 'تاریخ اتمام دوره (شمسی)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'توضیحات دوره'
    },
    thumbnail: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'مسیر تصویر تامبنیل دوره'
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'قیمت دوره'
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ظرفیت دوره'
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'مکان برگزاری دوره (در صورت خالی بودن یعنی مجازی است)'
    },
    type: {
        type: DataTypes.ENUM('course', 'event', 'competition'),
        allowNull: false,
        defaultValue: 'course',
        comment: 'نوع: دوره، رویداد یا مسابقه'
    },
    isAvailable: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
        comment: 'آیا دوره در دسترس است'
    },
    unavailabilityReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'علت در دسترس نبودن دوره'
    },
    tags: {
        type: DataTypes.STRING(100), // ذخیره به صورت "tag1,tag2,tag3"
        allowNull: true,
        comment: 'حداکثر ۳ تگ استاتیک برای هر دوره/رویداد/مسابقه (با کاما جدا شود)'
    },
}, {
    tableName: 'courses',
    timestamps: true,
    comment: 'جدول دوره‌ها'
    });

    return Course;
};