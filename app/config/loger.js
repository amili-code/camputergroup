const { models } = require('./models');

/**
 * ثبت لاگ عملیات کاربر
 * @param {object} req - درخواست Express
 * @param {string} action - عملیات انجام شده
 */
async function logUserAction(req, action) {
    try {
        let userId = null;
        let userType = null;
        let userLastName = null;
        let userRole = null;

        // بررسی session کاربر
        if (req.session && req.session.user) {
            userId = req.session.user.id;
            userType = req.session.user.type;
            userLastName = req.session.user.lastName || req.session.user.firstName || 'کاربر';
            
            // تعیین نقش بر اساس نوع کاربر
            switch (userType) {
                case 'student':
                    userRole = 'دانشجو';
                    break;
                case 'teacher':
                    userRole = 'استاد';
                    break;
                default:
                    userRole = 'کاربر';
            }
        } else if (req.session && req.session.admin && req.session.admin.username != 'mainAdmin') {
            userId = req.session.admin.username;
            userType = 'admin';
            userLastName = req.session.admin.username;
            userRole = req.session.admin.role === 'admin' ? 'ادمین' : 
                      req.session.admin.role === 'communityAdmin' ? 'مدیر انجمن' : 'ادمین';
            
        } else {
            return;
        }

        // ایجاد توضیحات لاگ
        const description = `سرکار "${userLastName}" "${userRole}" محترم ${action}`;

        await models.Log.create({ 
            userId: userId.toString(), 
            type: userType, 
            description 
        });
    } catch (err) {
        // اگر لاگ ثبت نشد، فقط در کنسول نمایش بده (اپلیکیشن نباید crash کند)
        console.error('Log Error:', err);
    }
}

/**
 * ثبت لاگ عملیات کاربر (نسخه قدیمی برای سازگاری)
 * @param {number} userId - آیدی کاربر
 * @param {string} type - نوع کاربر ('student' | 'teacher' | 'groupAdmin' | ...)
 * @param {string} description - توضیحات لاگ
 */
async function logUserActionLegacy(userId, type, description) {
    try {
        await models.Log.create({ userId, type, description });
    } catch (err) {
        console.error('Log Error:', err);
    }
}

module.exports = { logUserAction, logUserActionLegacy };
