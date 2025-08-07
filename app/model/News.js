const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const News = sequelize.define('News', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        type: {
            type: DataTypes.ENUM('news', 'announcement'),
            allowNull: false,
            comment: 'news = خبر، announcement = اطلاعیه'
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'عنوان خبر یا اطلاعیه'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: 'توضیحات خبر یا اطلاعیه'
        },
        image: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'مسیر تصویر خبر یا اطلاعیه'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'آیا خبر/اطلاعیه فعال است (بر اساس تاریخ انقضا به‌روزرسانی می‌شود)'
        },
        tags: {
            type: DataTypes.STRING(100), // ذخیره به صورت "tag1,tag2,tag3"
            allowNull: false,
            comment: 'حداکثر ۳ تگ استاتیک برای هر خبر یا اطلاعیه (با کاما جدا شود)'
        },
        writer: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'نام خانوادگی دبیر یا username ادمین نویسنده خبر'
        }
    }, {
        tableName: 'news',
        timestamps: true,
        comment: 'جدول اخبار و اطلاعیه‌ها با پشتیبانی از تگ و تاریخ انقضا'
    });

    return News;
};
