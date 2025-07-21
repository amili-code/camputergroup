const { sequelize } = require('./database');

// Import مدل‌ها
const Student = require('../model/student')(sequelize);
const Teacher = require('../model/teacher')(sequelize);
const Course = require('../model/course')(sequelize);
const Training = require('../model/training')(sequelize);

// ثبت مدل‌ها در Sequelize
const models = {
    Student,
    Teacher,
    Course,
    Training
};

// تعریف روابط بین مدل‌ها (در صورت نیاز)
// Object.keys(models).forEach(modelName => {
//     if (models[modelName].associate) {
//         models[modelName].associate(models);
//     }
// });

module.exports = { models, sequelize }; 