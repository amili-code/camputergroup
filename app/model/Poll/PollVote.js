const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PollVote = sequelize.define('PollVote', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            comment: 'آیدی داخلی اتو اینکریمنت'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'آیدی کاربری که رای داده است (student یا teacher)'
        },
        userType: {
            type: DataTypes.ENUM('student', 'teacher'),
            allowNull: false,
            comment: 'نوع کاربر: دانشجو یا استاد'
        },
        pollQuestionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'آیدی سوال نظرسنجی'
        },
        pollOptionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'آیدی گزینه‌ای که کاربر به آن رای داده است'
        },
        ipAddress: {
            type: DataTypes.STRING(45),
            allowNull: true,
            comment: 'آدرس IP کاربر برای جلوگیری از رای‌گیری تکراری'
        },
        userAgent: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'User Agent مرورگر کاربر'
        }
    }, {
        tableName: 'poll_votes',
        timestamps: true,
        indexes: [
            { fields: ['userId', 'userType'] },
            { fields: ['pollQuestionId'] },
            { fields: ['pollOptionId'] },
            { 
                unique: true, 
                fields: ['userId', 'userType', 'pollQuestionId'],
                comment: 'هر کاربر فقط یک بار می‌تواند به هر سوال رای دهد'
            }
        ],
        hooks: {
            beforeCreate: async (vote, options) => {
                // بررسی اینکه کاربر قبلاً به این سوال رای نداده باشد
                const existingVote = await sequelize.models.PollVote.findOne({
                    where: {
                        userId: vote.userId,
                        userType: vote.userType,
                        pollQuestionId: vote.pollQuestionId
                    }
                });
                
                if (existingVote) {
                    throw new Error('شما قبلاً به این سوال رای داده‌اید');
                }
                
                // بررسی اینکه گزینه انتخابی متعلق به سوال مورد نظر باشد
                const option = await sequelize.models.PollOption.findByPk(vote.pollOptionId);
                if (!option || option.pollQuestionId !== vote.pollQuestionId) {
                    throw new Error('گزینه انتخابی معتبر نیست');
                }
            }
        },
        comment: 'جدول ثبت رای کاربران به گزینه‌های نظرسنجی'
    });

    return PollVote;
};