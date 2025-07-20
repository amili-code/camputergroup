const { sequelize, connectDB } = require('./database');
const { models } = require('./models');

async function syncDatabase() {
    await connectDB();

    try {
        // ثبت مدل‌ها در Sequelize
        Object.keys(models).forEach(modelName => {
            sequelize.models[modelName] = models[modelName];
        });
        
        await sequelize.sync({ alter: true }); // ایجاد یا آپدیت جداول
        console.log("✅ جداول دیتابیس با موفقیت همگام‌سازی شد.");
        process.exit();
    } catch (error) {
        console.error("❌ خطا در همگام‌سازی دیتابیس:", error);
        process.exit(1);
    }
}

module.exports = { syncDatabase };
