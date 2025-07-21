const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PollOption = sequelize.define('PollOption', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        pollQuestionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'آیدی سوال نظرسنجی که این گزینه به آن تعلق دارد'
        },
        optionText: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'متن گزینه'
        }
    }, {
        tableName: 'poll_options',
        timestamps: true,
        comment: 'گزینه‌های هر سوال نظرسنجی'
    });

    return PollOption;
}; 