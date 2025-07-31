const { models } = require('../config/models');
const { logUserAction } = require('../config/loger');

class CommunityController {
    // CREATE - درخواست عضویت جدید
    async createMembership(req, res) {
        try {
            const { studentId, description } = req.body;
            if (!studentId) {
                return res.status(400).json({ success: false, message: 'کد دانشجویی الزامی است.' });
            }
            if (!description || !description.trim()) {
                return res.status(400).json({ success: false, message: 'توضیحات عضویت الزامی است.' });
            }
            // جستجو بر اساس studentId (کد دانشجویی رشته‌ای)
            const student = await models.Student.findOne({ where: { studentId: studentId } });
            if (!student) {
                return res.status(404).json({ success: false, message: 'دانشجو یافت نشد.' });
            }
            // بررسی عدم وجود درخواست قبلی
            const exists = await models.Community.findOne({ where: { studentId: student.id } });
            if (exists) {
                return res.status(400).json({ success: false, message: 'درخواست قبلاً ثبت شده است.' });
            }
            const member = await models.Community.create({ studentId: student.id, description });
            // ثبت لاگ درخواست عضویت
            await logUserAction(student.id, 'student', `درخواست عضویت در انجمن ثبت شد.`);
            res.status(201).json({ success: true, data: member });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در ثبت درخواست عضویت', error: error.message });
        }
    }

    // READ - دریافت همه اعضا
    async getAllMembers(req, res) {
        try {
            // بررسی نقش ادمین واقعی
            let isRealAdmin = false;
            if (req.session && req.session.admin && req.session.admin.role === 'admin') {
                const fs = require('fs');
                const path = require('path');
                const adminPath = path.join(__dirname, '../../scripts/admin.json');
                let adminData = JSON.parse(fs.readFileSync(adminPath, 'utf8'));
                if (req.session.admin.username === adminData.admin.username) {
                    isRealAdmin = true;
                }
            }
            // بررسی مدیر انجمن
            const isCommunityAdmin = req.session && req.session.admin && req.session.admin.role === 'communityAdmin';
            
            const members = await models.Community.findAll({
                include: [{
                    model: models.Student,
                    attributes: isRealAdmin || isCommunityAdmin 
                        ? { exclude: ['password', 'nationalCode'] } 
                        : { exclude: ['studentId', 'phone', 'password', 'nationalCode'] }
                }],
                order: [['createdAt', 'DESC']]
            });
            res.json({ success: true, data: members });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در دریافت اعضا', error: error.message });
        }
    }

    // READ - دریافت یک عضو
    async getMemberById(req, res) {
        try {
            const { id } = req.params;
            const member = await models.Community.findByPk(id, {
                include: [{
                    model: models.Student,
                    attributes: { exclude: ['studentId', 'phone', 'password', 'nationalCode'] }
                }]
            });
            if (!member) {
                return res.status(404).json({ success: false, message: 'عضو یافت نشد.' });
            }
            res.json({ success: true, data: member });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در دریافت عضو', error: error.message });
        }
    }

    // UPDATE - تایید یا رد عضویت
    async updateMembershipStatus(req, res) {
        try {
            const { id } = req.params;
            const { isAccepted } = req.body;
            const member = await models.Community.findByPk(id);
            if (!member) {
                return res.status(404).json({ success: false, message: 'عضو یافت نشد.' });
            }
            await member.update({ isAccepted });
            // ثبت لاگ تایید یا رد عضویت
            const statusText = isAccepted ? 'تایید' : 'رد';
            await logUserAction(member.studentId, 'student', `درخواست عضویت شما در انجمن ${statusText} شد.`);
            res.json({ success: true, data: member });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در بروزرسانی وضعیت عضویت', error: error.message });
        }
    }

    // UPDATE - تعیین یا حذف مدیر گروه
    async setManager(req, res) {
        try {
            const { id } = req.params;
            const member = await models.Community.findByPk(id);
            if (!member) {
                return res.status(404).json({ success: false, message: 'عضو یافت نشد.' });
            }
            // فقط یک مدیر مجاز است
            await models.Community.update({ isManager: false }, { where: {} });
            await member.update({ isManager: true });

            // دریافت نام خانوادگی مدیر جدید
            const student = await models.Student.findByPk(member.studentId);
            let lastName = student ? student.lastName : '';
            // به‌روزرسانی admin.json
            const fs = require('fs');
            const path = require('path');
            const adminPath = path.join(__dirname, '../../scripts/admin.json');
            let adminData = JSON.parse(fs.readFileSync(adminPath, 'utf8'));
            adminData.communityAdmin.username = lastName;
            adminData.communityAdmin.password = '';
            fs.writeFileSync(adminPath, JSON.stringify(adminData, null, 4), 'utf8');

            res.json({ success: true, message: 'مدیر گروه با موفقیت تعیین شد.', data: member });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در تعیین مدیر گروه', error: error.message });
        }
    }

    // UPDATE - حذف مدیر بودن از یک عضو
    async unsetManager(req, res) {
        try {
            const { id } = req.params;
            const member = await models.Community.findByPk(id);
            if (!member) {
                return res.status(404).json({ success: false, message: 'عضو یافت نشد.' });
            }
            await member.update({ isManager: false });
            res.json({ success: true, message: 'مدیر بودن حذف شد.', data: member });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در حذف مدیر بودن', error: error.message });
        }
    }

    // DELETE - حذف عضو
    async deleteMember(req, res) {
        try {
            const { id } = req.params;
            const member = await models.Community.findByPk(id);
            if (!member) {
                return res.status(404).json({ success: false, message: 'عضو یافت نشد.' });
            }
            await member.destroy();
            res.json({ success: true, message: 'عضو با موفقیت حذف شد.' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در حذف عضو', error: error.message });
        }
    }
}

module.exports = new CommunityController();
