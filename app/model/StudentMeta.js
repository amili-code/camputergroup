const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const StudentMeta = sequelize.define('StudentMeta', {
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
        // لینک‌های شبکه‌های اجتماعی (حداکثر 3 تا با کاما جدا)
        socialLinks: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'social_links',
            comment: 'لینک‌های شبکه‌های اجتماعی (حداکثر 3 تا با کاما جدا)',
            validate: {
                maxSocialLinks(value) {
                    if (value) {
                        const links = value.split(',').map(link => link.trim()).filter(link => link.length > 0);
                        if (links.length > 3) {
                            throw new Error('حداکثر 3 لینک شبکه اجتماعی مجاز است');
                        }
                    }
                }
            }
        },
        // معرفی و توضیحات
        introduction: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'introduction',
            comment: 'معرفی و توضیحات دانشجو'
        },
        // مهارت‌ها (حداکثر 3 تا با کاما جدا)
        skills: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'skills',
            comment: 'مهارت‌های دانشجو (حداکثر 3 تا با کاما جدا)',
            validate: {
                maxSkills(value) {
                    if (value) {
                        const skills = value.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
                        if (skills.length > 3) {
                            throw new Error('حداکثر 3 مهارت مجاز است');
                        }
                    }
                }
            }
        }
    }, {
        tableName: 'student_meta',
        timestamps: true,
        indexes: [
            { unique: true, fields: ['student_id'] }
        ],
        hooks: {
            beforeValidate: (studentMeta) => {
                // پاک کردن فضاهای خالی از لینک‌ها و مهارت‌ها
                if (studentMeta.socialLinks) {
                    studentMeta.socialLinks = studentMeta.socialLinks
                        .split(',')
                        .map(link => link.trim())
                        .filter(link => link.length > 0)
                        .join(',');
                }
                
                if (studentMeta.skills) {
                    studentMeta.skills = studentMeta.skills
                        .split(',')
                        .map(skill => skill.trim())
                        .filter(skill => skill.length > 0)
                        .join(',');
                }
            }
        }
    });

    // تعریف رابطه با مدل Student
    StudentMeta.associate = (models) => {
        StudentMeta.belongsTo(models.Student, {
            foreignKey: 'studentId',
            as: 'Student'
        });
    };

    return StudentMeta;
}; 