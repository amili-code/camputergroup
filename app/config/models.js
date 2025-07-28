const { sequelize } = require('./database');

// Import مدل‌ها
const Student = require('../model/Student')(sequelize);
const Teacher = require('../model/Teacher')(sequelize);
const Course = require('../model/Course')(sequelize);
const CourseRegistration = require('../model/CourseRegistration')(sequelize);
const Training = require('../model/Training')(sequelize);
const News = require('../model/News')(sequelize);
const PollQuestion = require('../model/Poll/PollQuestion')(sequelize);
const PollOption = require('../model/Poll/PollOption')(sequelize);
const PollVote = require('../model/Poll/PollVote')(sequelize);
const Community = require('../model/Community')(sequelize);
const Reservation = require('../model/Reservation')(sequelize);

// ثبت مدل‌ها در Sequelize
const models = {
    Student,
    Teacher,
    Course,
    CourseRegistration,
    Training,
    News,
    PollQuestion,
    PollOption,
    PollVote,
    Community,
    Reservation
};

// تعریف روابط بین مدل‌ها (cascade delete)
News.hasMany(PollQuestion, { foreignKey: 'newsId', onDelete: 'CASCADE' });
PollQuestion.belongsTo(News, { foreignKey: 'newsId' });
PollQuestion.hasMany(PollOption, { foreignKey: 'pollQuestionId', onDelete: 'CASCADE' });
PollOption.belongsTo(PollQuestion, { foreignKey: 'pollQuestionId' });
PollQuestion.hasMany(PollVote, { foreignKey: 'pollQuestionId', onDelete: 'CASCADE' });
PollVote.belongsTo(PollQuestion, { foreignKey: 'pollQuestionId' });
PollOption.hasMany(PollVote, { foreignKey: 'pollOptionId', onDelete: 'CASCADE' });
PollVote.belongsTo(PollOption, { foreignKey: 'pollOptionId' });
Student.hasMany(Community, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Community.belongsTo(Student, { foreignKey: 'studentId' });

// روابط مربوط به ثبت نام در دوره‌ها
Student.hasMany(CourseRegistration, { foreignKey: 'studentId', onDelete: 'CASCADE' });
CourseRegistration.belongsTo(Student, { foreignKey: 'studentId' });
Course.hasMany(CourseRegistration, { foreignKey: 'courseId', onDelete: 'CASCADE' });
CourseRegistration.belongsTo(Course, { foreignKey: 'courseId' });

// روابط مربوط به رزرواسیون
Student.hasMany(Reservation, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Reservation.belongsTo(Student, { foreignKey: 'studentId' });
Teacher.hasMany(Reservation, { foreignKey: 'teacherId', onDelete: 'CASCADE' });
Reservation.belongsTo(Teacher, { foreignKey: 'teacherId' });

module.exports = { models, sequelize }; 