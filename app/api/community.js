const { models } = require('../config/models');

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
            res.status(201).json({ success: true, data: member });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در ثبت درخواست عضویت', error: error.message });
        }
    }

    // READ - دریافت همه اعضا
    async getAllMembers(req, res) {
        try {
            const members = await models.Community.findAll({
                include: [models.Student],
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
            const member = await models.Community.findByPk(id, { include: [{ model: models.Student, as: 'student' }] });
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
