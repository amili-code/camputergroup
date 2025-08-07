const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const TeacherMeta = sequelize.define('TeacherMeta', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        teacherId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'teachers',
                key: 'id'
            },
            comment: 'آیدی استاد'
        },
        type: {
            type: DataTypes.ENUM('text', 'image', 'file', 'link'),
            allowNull: false,
            comment: 'نوع محتوا: متن، تصویر، فایل یا لینک'
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: true,
            comment: 'عنوان محتوا'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'توضیحات اختیاری برای این بخش'
        },
        textContent: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'محتوای متنی (در صورت نوع text)'
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
        linkUrl: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'آدرس لینک (در صورت نوع link)'
        },
        linkTitle: {
            type: DataTypes.STRING(200),
            allowNull: true,
            comment: 'عنوان لینک (در صورت نوع link)'
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'ترتیب نمایش (اعداد کوچکتر بالاتر نمایش داده می‌شوند)'
        },
        isPublished: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'وضعیت انتشار (true = منتشر شده، false = پیش‌نویس)'
        }
    }, {
        tableName: 'teacher_meta',
        timestamps: true,
        comment: 'جدول محتوای وبلاگ شخصی اساتید'
    });

    // تعریف رابطه با مدل Teacher
    TeacherMeta.associate = (models) => {
        TeacherMeta.belongsTo(models.Teacher, {
            foreignKey: 'teacherId',
            as: 'teacher'
        });
    };

    return TeacherMeta;
}; 