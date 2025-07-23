const { sequelize } = require('./database');

// Import مدل‌ها
const Student = require('../model/Student')(sequelize);
const Teacher = require('../model/Teacher')(sequelize);
const Course = require('../model/Course')(sequelize);
const Training = require('../model/Training')(sequelize);
const News = require('../model/News')(sequelize);
const PollQuestion = require('../model/Poll/PollQuestion')(sequelize);
const PollOption = require('../model/Poll/PollOption')(sequelize);
const Community = require('../model/Community')(sequelize);

// ثبت مدل‌ها در Sequelize
const models = {
    Student,
    Teacher,
    Course,
    Training,
    News,
    PollQuestion,
    PollOption,
    Community
};

// تعریف روابط بین مدل‌ها (cascade delete)
News.hasMany(PollQuestion, { foreignKey: 'newsId', onDelete: 'CASCADE' });
PollQuestion.belongsTo(News, { foreignKey: 'newsId' });
PollQuestion.hasMany(PollOption, { foreignKey: 'pollQuestionId', onDelete: 'CASCADE' });
PollOption.belongsTo(PollQuestion, { foreignKey: 'pollQuestionId' });
Student.hasMany(Community, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Community.belongsTo(Student, { foreignKey: 'studentId' });

module.exports = { models, sequelize }; 