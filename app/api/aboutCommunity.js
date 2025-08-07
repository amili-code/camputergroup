const { models } = require('../config/models');
const path = require('path');
const fs = require('fs');
const { logUserAction } = require('../config/loger');

class CommunityControllerAbout {
    async createSection(req, res) {
        try {
            const { type, description, textContent, order } = req.body;
            let imagePath = null;
            let filePath = null;

            if (req.file) {
                const relativePath = req.file.mimetype.startsWith('image/') ? 
                    `/pic/about/${req.file.filename}` : 
                    `/files/about/${req.file.filename}`;
                if (type === 'image') imagePath = relativePath;
                else if (type === 'file') filePath = relativePath;
            }

            const section = await models.AboutUsCommunity.create({
                type,
                description,
                textContent: type === 'text' ? textContent : null,
                imagePath,
                filePath,
                order
            });

            // ثبت لاگ
            await logUserAction(req, `بخش جدید درباره انجمن با عنوان "${description}" ثبت کرد`);

            res.json({ success: true, data: section });
        } catch (err) {
            console.error('Create error:', err);
            res.status(500).json({ success: false, message: 'خطا در ایجاد بخش' });
        }
    }

    // گرفتن لیست همه بخش‌ها
    async getAllSections(req, res) {
        try {
            const sections = await models.AboutUsCommunity.findAll({
                order: [['order', 'ASC']]
            });
            res.json({ success: true, data: sections });
        } catch (err) {
            console.error('Fetch error:', err);
            res.status(500).json({ success: false, message: 'خطا در دریافت اطلاعات' });
        }
    }

    // گرفتن یک بخش خاص
    async getSection(req, res) {
        try {
            const section = await models.AboutUsCommunity.findByPk(req.params.id);
            if (!section) return res.status(404).json({ success: false, message: 'بخش یافت نشد' });
            res.json({ success: true, data: section });
        } catch (err) {
            res.status(500).json({ success: false, message: 'خطا در دریافت بخش' });
        }
    }

    // ویرایش بخش
    async updateSection(req, res) {
        try {
            const section = await models.AboutUsCommunity.findByPk(req.params.id);
            if (!section) return res.status(404).json({ success: false, message: 'بخش یافت نشد' });

            const { type, description, textContent, order } = req.body;

            let newImagePath = section.imagePath;
            let newFilePath = section.filePath;

            if (req.file) {
                const relativePath = req.file.mimetype.startsWith('image/') ? 
                    `/pic/about/${req.file.filename}` : 
                    `/files/about/${req.file.filename}`;

                // حذف فایل قبلی اگر وجود دارد
                if (section.imagePath && type === 'image') {
                    const full = path.join(__dirname, '../../public', section.imagePath);
                    if (fs.existsSync(full)) fs.unlinkSync(full);
                    newImagePath = relativePath;
                } else if (section.filePath && type === 'file') {
                    const full = path.join(__dirname, '../../public', section.filePath);
                    if (fs.existsSync(full)) fs.unlinkSync(full);
                    newFilePath = relativePath;
                }

                if (type === 'image') newImagePath = relativePath;
                if (type === 'file') newFilePath = relativePath;
            }

            await section.update({
                type,
                description,
                textContent: type === 'text' ? textContent : null,
                imagePath: type === 'image' ? newImagePath : null,
                filePath: type === 'file' ? newFilePath : null,
                order
            });

            // ثبت لاگ
            await logUserAction(req, `بخش درباره انجمن با عنوان "${section.description}" را ویرایش کرد`);

            res.json({ success: true, message: 'بروزرسانی با موفقیت انجام شد', data: section });
        } catch (err) {
            console.error('Update error:', err);
            res.status(500).json({ success: false, message: 'خطا در بروزرسانی بخش' });
        }
    }

    // حذف بخش
    async deleteSection(req, res) {
        try {
            const section = await models.AboutUsCommunity.findByPk(req.params.id);
            if (!section) return res.status(404).json({ success: false, message: 'بخش یافت نشد' });

            // حذف فایل‌ها اگر وجود دارد
            if (section.imagePath) {
                const full = path.join(__dirname, '../../public', section.imagePath);
                if (fs.existsSync(full)) fs.unlinkSync(full);
            }
            if (section.filePath) {
                const full = path.join(__dirname, '../../public', section.filePath);
                if (fs.existsSync(full)) fs.unlinkSync(full);
            }

            await section.destroy();

            // ثبت لاگ
            await logUserAction(req, `بخش درباره انجمن با عنوان "${section.description}" را حذف کرد`);

            res.json({ success: true, message: 'بخش حذف شد' });
        } catch (err) {
            console.error('Delete error:', err);
            res.status(500).json({ success: false, message: 'خطا در حذف بخش' });
        }
    }

    // تغییر ترتیب بخش‌ها
    async reorderSections(req, res) {
        try {
            const { sections } = req.body; // آرایه‌ای از {id, order}
            
            if (!Array.isArray(sections)) {
                return res.status(400).json({ success: false, message: 'داده‌های نامعتبر' });
            }

            // بروزرسانی ترتیب همه بخش‌ها
            for (const section of sections) {
                await models.AboutUsCommunity.update(
                    { order: section.order },
                    { where: { id: section.id } }
                );
            }

            res.json({ success: true, message: 'ترتیب با موفقیت تغییر کرد' });
        } catch (err) {
            console.error('Reorder error:', err);
            res.status(500).json({ success: false, message: 'خطا در تغییر ترتیب' });
        }
    }
}

module.exports = new CommunityControllerAbout();
