const { sequelize } = require('./database');

// Import مدل‌ها
const Student = require('../model/Student')(sequelize);
const Teacher = require('../model/Teacher')(sequelize);
const Course = require('../model/Course')(sequelize);
const Training = require('../model/Training')(sequelize);
const News = require('../model/News')(sequelize);
const PollQuestion = require('../model/Poll/PollQuestion')(sequelize);
const PollOption = require('../model/Poll/PollOption')(sequelize);

// ثبت مدل‌ها در Sequelize
const models = {
    Student,
    Teacher,
    Course,
    Training,
    News,
    PollQuestion,
    PollOption
};

// تعریف روابط بین مدل‌ها (در صورت نیاز)
// Object.keys(models).forEach(modelName => {
//     if (models[modelName].associate) {
//         models[modelName].associate(models);
//     }
// });

module.exports = { models, sequelize }; 