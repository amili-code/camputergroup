const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Admin = sequelize.define('Admin', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'نام کاربری ادمین'
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'رمز عبور هش‌شده'
        }
    }, {
        tableName: 'admins',
        timestamps: true,
        comment: 'اطلاعات تمام ادمین‌ها شامل مدیر انجمن'
    });

    const CommunityAdminMeta = sequelize.define('CommunityAdminMeta', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'ارجاع به دانشجویی که در حال حاضر مدیر انجمن است',
            references: {
                model: 'students', // نام جدول students هست
                key: 'id'
            }
        },
        fullName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'نام کامل مدیر فعلی انجمن'
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'رمز عبور هش‌شده مدیر انجمن (برگرفته از دانشجو)'
        }
    }, {
        tableName: 'community_admin_meta',
        timestamps: true,
        comment: 'اطلاعات مربوط به مدیر انجمن (فقط یک ردیف فعال)'
    });


  
    return { Admin, CommunityAdminMeta };
};
