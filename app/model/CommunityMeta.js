const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const AboutUsCommunity = sequelize.define('AboutUsCommunity', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        type: {
            type: DataTypes.ENUM('image', 'file', 'text'),
            allowNull: false,
            comment: 'نوع محتوا: تصویر، فایل یا متن'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'توضیحات اختیاری برای این بخش'
        },
        imagePath: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'آدرس تصویر (در صورت نوع image)'
        },
        filePath: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'آدرس فایل (در صورت نوع file)'
        },
        textContent: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'محتوای متنی (در صورت نوع text)'
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'ترتیب نمایش (اعداد کوچکتر بالاتر نمایش داده می‌شوند)'
        }
    }, {
        tableName: 'about_us_sections',
        timestamps: true,
        comment: 'جدول محتوای داینامیک برای صفحه درباره ما'
    });

    return AboutUsCommunity;
};
