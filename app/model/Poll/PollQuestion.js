const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PollQuestion = sequelize.define('PollQuestion', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        newsId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'آیدی اطلاعیه (news) که این سوال به آن تعلق دارد'
        },
        question: {
            type: DataTypes.STRING(500),
            allowNull: false,
            comment: 'متن سوال نظرسنجی'
        }
    }, {
        tableName: 'poll_questions',
        timestamps: true,
        comment: 'سوالات نظرسنجی متصل به اطلاعیه'
    });

    return PollQuestion;
}; 