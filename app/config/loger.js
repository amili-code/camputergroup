const { models } = require('./models');

/**
 * ثبت لاگ عملیات کاربر
 * @param {number} userId - آیدی کاربر
 * @param {string} type - نوع کاربر ('student' | 'teacher' | 'groupAdmin' | ...)
 * @param {string} description - توضیحات لاگ
 */
async function logUserAction(userId, type, description) {
    try {
        await models.Log.create({ userId, type, description });
    } catch (err) {
        // اگر لاگ ثبت نشد، فقط در کنسول نمایش بده (اپلیکیشن نباید crash کند)
        console.error('Log Error:', err);
    }
}

module.exports = { logUserAction };
