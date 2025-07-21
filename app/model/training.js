const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const TrainingCategory = sequelize.define('TrainingCategory', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'عنوان دسته یا زیرشاخه'
        },
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'آیدی والد (در صورت وجود)'
        },
        filePath: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'مسیر فایل نهایی (در صورت وجود)'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'توضیحات اختیاری'
        }
    }, {
        tableName: 'training_categories',
        timestamps: true,
        comment: 'دسته‌بندی سلسله‌مراتبی آموزش با قابلیت چند سطحی و فایل نهایی'
    });

    // ارتباط خودارجاعی برای ساختار درختی
    TrainingCategory.hasMany(TrainingCategory, { as: 'children', foreignKey: 'parentId' });
    TrainingCategory.belongsTo(TrainingCategory, { as: 'parent', foreignKey: 'parentId' });

    return TrainingCategory;
};
