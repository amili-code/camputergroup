const { models } = require('../config/models');
const path = require('path');
const fs = require('fs');
const { logUserAction } = require('../config/loger');

class TeacherMetaController {
    // ایجاد محتوای جدید
    async createMeta(req, res) {
        try {
            const { type, title, description, textContent, linkUrl, linkTitle, order } = req.body;
            const teacherId = req.session.user.id; // از session کاربر

            let imagePath = null;
            let filePath = null;

            if (req.file) {
                const relativePath = req.file.mimetype.startsWith('image/') ? 
                    `/pic/teachers/${req.file.filename}` : 
                    `/files/teachers/${req.file.filename}`;
                if (type === 'image') imagePath = relativePath;
                else if (type === 'file') filePath = relativePath;
            }

            const meta = await models.AboutUsTeacher.create({
                teacherId,
                type,
                title,
                description,
                textContent: type === 'text' ? textContent : null,
                imagePath,
                filePath,
                linkUrl: type === 'link' ? linkUrl : null,
                linkTitle: type === 'link' ? linkTitle : null,
                order: order || 0,
                isPublished: true
            });

            // ثبت لاگ
            await logUserAction(req, `محتوای جدید با عنوان "${description}" برای وبلاگ شخصی ثبت کرد`);

            res.json({ success: true, data: meta });
        } catch (err) {
            console.error('Create teacher meta error:', err);
            res.status(500).json({ success: false, message: 'خطا در ایجاد محتوا' });
        }
    }

    // دریافت تمام محتوای یک استاد
    async getTeacherMeta(req, res) {
        try {
            const { teacherId } = req.params;
            const { published } = req.query;

            let whereClause = { teacherId };
            
            // اگر published=true باشد، فقط محتوای منتشر شده را برگردان
            if (published === 'true') {
                whereClause.isPublished = true;
            }

            const meta = await models.AboutUsTeacher.findAll({
                where: whereClause,
                order: [['order', 'ASC']],
                include: [{
                    model: models.Teacher,
                    as: 'teacher',
                    attributes: ['id', 'firstName', 'lastName', 'teacherId', 'personalImage']
                }]
            });

            res.json({ success: true, data: meta });
        } catch (err) {
            console.error('Get teacher meta error:', err);
            res.status(500).json({ success: false, message: 'خطا در دریافت محتوا' });
        }
    }

    // دریافت یک محتوای خاص
    async getMetaById(req, res) {
        try {
            const { id } = req.params;
            const meta = await models.AboutUsTeacher.findByPk(id, {
                include: [{
                    model: models.Teacher,
                    as: 'teacher',
                    attributes: ['id', 'firstName', 'lastName', 'teacherId', 'personalImage']
                }]
            });

            if (!meta) {
                return res.status(404).json({ success: false, message: 'محتوا یافت نشد' });
            }

            res.json({ success: true, data: meta });
        } catch (err) {
            console.error('Get meta by id error:', err);
            res.status(500).json({ success: false, message: 'خطا در دریافت محتوا' });
        }
    }

    // ویرایش محتوا
    async updateMeta(req, res) {
        try {
            const { id } = req.params;
            const { type, title, description, textContent, linkUrl, linkTitle, order } = req.body;
            const teacherId = req.session.user.id;

            const meta = await models.AboutUsTeacher.findOne({
                where: { id, teacherId }
            });

            if (!meta) {
                return res.status(404).json({ success: false, message: 'محتوا یافت نشد' });
            }

            let newImagePath = meta.imagePath;
            let newFilePath = meta.filePath;

            if (req.file) {
                const relativePath = req.file.mimetype.startsWith('image/') ? 
                    `/pic/teachers/${req.file.filename}` : 
                    `/files/teachers/${req.file.filename}`;

                // حذف فایل قبلی اگر وجود دارد
                if (meta.imagePath && type === 'image') {
                    const full = path.join(__dirname, '../../public', meta.imagePath);
                    if (fs.existsSync(full)) fs.unlinkSync(full);
                    newImagePath = relativePath;
                } else if (meta.filePath && type === 'file') {
                    const full = path.join(__dirname, '../../public', meta.filePath);
                    if (fs.existsSync(full)) fs.unlinkSync(full);
                    newFilePath = relativePath;
                }

                if (type === 'image') newImagePath = relativePath;
                if (type === 'file') newFilePath = relativePath;
            }

            await meta.update({
                type,
                title,
                description,
                textContent: type === 'text' ? textContent : null,
                imagePath: type === 'image' ? newImagePath : null,
                filePath: type === 'file' ? newFilePath : null,
                linkUrl: type === 'link' ? linkUrl : null,
                linkTitle: type === 'link' ? linkTitle : null,
                order: order || meta.order
            });

            // ثبت لاگ
            await logUserAction(req, `محتوای وبلاگ شخصی با عنوان "${meta.description}" را ویرایش کرد`);

            res.json({ success: true, message: 'بروزرسانی با موفقیت انجام شد', data: meta });
        } catch (err) {
            console.error('Update teacher meta error:', err);
            res.status(500).json({ success: false, message: 'خطا در بروزرسانی محتوا' });
        }
    }

    // حذف محتوا
    async deleteMeta(req, res) {
        try {
            const { id } = req.params;
            const teacherId = req.session.user.id;

            const meta = await models.AboutUsTeacher.findOne({
                where: { id, teacherId }
            });

            if (!meta) {
                return res.status(404).json({ success: false, message: 'محتوا یافت نشد' });
            }

            // حذف فایل‌ها اگر وجود دارد
            if (meta.imagePath) {
                const full = path.join(__dirname, '../../public', meta.imagePath);
                if (fs.existsSync(full)) fs.unlinkSync(full);
            }
            if (meta.filePath) {
                const full = path.join(__dirname, '../../public', meta.filePath);
                if (fs.existsSync(full)) fs.unlinkSync(full);
            }

            await meta.destroy();

            // ثبت لاگ
            await logUserAction(req, `محتوای وبلاگ شخصی با عنوان "${meta.description}" را حذف کرد`);

            res.json({ success: true, message: 'محتوا حذف شد' });
        } catch (err) {
            console.error('Delete teacher meta error:', err);
            res.status(500).json({ success: false, message: 'خطا در حذف محتوا' });
        }
    }

    // تغییر ترتیب محتوا
    async reorderMeta(req, res) {
        try {
            const { teacherId } = req.params;
            const { sections } = req.body; // آرایه‌ای از {id, order}
            
            if (!Array.isArray(sections)) {
                return res.status(400).json({ success: false, message: 'داده‌های نامعتبر' });
            }

            // بررسی اینکه آیا کاربر مالک این محتوا است
            const userTeacherId = req.session.user.id;
            if (parseInt(teacherId) !== userTeacherId) {
                return res.status(403).json({ success: false, message: 'دسترسی غیرمجاز' });
            }

            // بروزرسانی ترتیب همه بخش‌ها
            for (const section of sections) {
                await models.AboutUsTeacher.update(
                    { order: section.order },
                    { where: { id: section.id, teacherId } }
                );
            }

            res.json({ success: true, message: 'ترتیب با موفقیت تغییر کرد' });
        } catch (err) {
            console.error('Reorder teacher meta error:', err);
            res.status(500).json({ success: false, message: 'خطا در تغییر ترتیب' });
        }
    }

    // تغییر وضعیت انتشار
    async togglePublish(req, res) {
        try {
            const { id } = req.params;
            const teacherId = req.session.user.id;

            const meta = await models.AboutUsTeacher.findOne({
                where: { id, teacherId }
            });

            if (!meta) {
                return res.status(404).json({ success: false, message: 'محتوا یافت نشد' });
            }

            await meta.update({
                isPublished: !meta.isPublished
            });

            res.json({ 
                success: true, 
                message: meta.isPublished ? 'محتوا منتشر شد' : 'محتوا به پیش‌نویس تغییر یافت',
                data: meta 
            });
        } catch (err) {
            console.error('Toggle publish error:', err);
            res.status(500).json({ success: false, message: 'خطا در تغییر وضعیت انتشار' });
        }
    }
}

module.exports = new TeacherMetaController();
