const { sequelize } = require('./database');

// Import مدل‌ها
const Student = require('../model/student')(sequelize);
const Teacher = require('../model/teacher')(sequelize);

// ثبت مدل‌ها در Sequelize
const models = {
    Student,
    Teacher
};

// تعریف روابط بین مدل‌ها (در صورت نیاز)
// Object.keys(models).forEach(modelName => {
//     if (models[modelName].associate) {
//         models[modelName].associate(models);
//     }
// });

module.exports = { models, sequelize }; 