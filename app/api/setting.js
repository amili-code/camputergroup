const fs = require('fs/promises');
const path = require('path');
const { models } = require('../config/models');

const SETTING_PATH = path.join(__dirname, '../setting.json');
const GALLERY_DIR = path.join(__dirname, '../../settings');

class SettingController {
    // GET - دریافت تنظیمات
    async getSettings(req, res) {
        try {
            const data = await fs.readFile(SETTING_PATH, 'utf-8');
            res.json({ success: true, data: JSON.parse(data) });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در خواندن تنظیمات', error: error.message });
        }
    }

    // PUT - ویرایش کل تنظیمات
    async updateSettings(req, res) {
        try {
            const newSettings = req.body;
            await fs.writeFile(SETTING_PATH, JSON.stringify(newSettings, null, 2), 'utf-8');
            res.json({ success: true, message: 'تنظیمات با موفقیت ذخیره شد.' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در ذخیره تنظیمات', error: error.message });
        }
    }

    // POST - افزودن عکس به گالری
    async addGalleryImage(req, res) {
        try {
            const { title, description, imagePath } = req.body;
            if (!title || !imagePath) {
                return res.status(400).json({ success: false, message: 'عنوان و مسیر عکس الزامی است.' });
            }
            const data = await fs.readFile(SETTING_PATH, 'utf-8');
            const settings = JSON.parse(data);
            settings.gallery = settings.gallery || [];
            settings.gallery.push({ title, description, imagePath });
            await fs.writeFile(SETTING_PATH, JSON.stringify(settings, null, 2), 'utf-8');
            res.json({ success: true, message: 'عکس به گالری اضافه شد.' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در افزودن عکس به گالری', error: error.message });
        }
    }

    // POST - آپلود عکس جدید به گالری (فایل باید توسط multer آپلود شود)
    async uploadGalleryImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'فایل عکس ارسال نشده است.' });
            }
            const { title, description } = req.body;
            const imagePath = `/pic/settings/${req.file.filename}`;
            const data = await fs.readFile(SETTING_PATH, 'utf-8');
            const settings = JSON.parse(data);
            settings.gallery = settings.gallery || [];
            settings.gallery.push({ title, description, imagePath });
            await fs.writeFile(SETTING_PATH, JSON.stringify(settings, null, 2), 'utf-8');
            res.json({ success: true, message: 'عکس با موفقیت آپلود و به گالری اضافه شد.', imagePath });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در آپلود عکس', error: error.message });
        }
    }

    // PUT - ویرایش اطلاعات یک عکس گالری (title, description)
    async updateGalleryImage(req, res) {
        try {
            const { index } = req.params;
            const { title, description } = req.body;
            const data = await fs.readFile(SETTING_PATH, 'utf-8');
            const settings = JSON.parse(data);
            if (!settings.gallery || !settings.gallery[index]) {
                return res.status(404).json({ success: false, message: 'عکس مورد نظر یافت نشد.' });
            }
            if (title !== undefined) settings.gallery[index].title = title;
            if (description !== undefined) settings.gallery[index].description = description;
            await fs.writeFile(SETTING_PATH, JSON.stringify(settings, null, 2), 'utf-8');
            res.json({ success: true, message: 'اطلاعات عکس بروزرسانی شد.' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در بروزرسانی عکس', error: error.message });
        }
    }

    // DELETE - حذف عکس از گالری و حذف فایل فیزیکی
    async deleteGalleryImage(req, res) {
        try {
            const { index } = req.params;
            const data = await fs.readFile(SETTING_PATH, 'utf-8');
            const settings = JSON.parse(data);
            if (!settings.gallery || !settings.gallery[index]) {
                return res.status(404).json({ success: false, message: 'عکس مورد نظر یافت نشد.' });
            }
            const imagePath = settings.gallery[index].imagePath;
            // حذف فایل فیزیکی
            if (imagePath && imagePath.startsWith('/pic/settings/')) {
                const filePath = path.join(GALLERY_DIR, path.basename(imagePath));
                try { await fs.unlink(filePath); } catch (e) { /* فایل وجود نداشت */ }
            }
            // حذف از آرایه
            settings.gallery.splice(index, 1);
            await fs.writeFile(SETTING_PATH, JSON.stringify(settings, null, 2), 'utf-8');
            res.json({ success: true, message: 'عکس با موفقیت حذف شد.' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در حذف عکس', error: error.message });
        }
    }

    // GET - آمار داشبورد
    async getDashboardStats(req, res) {
        try {
            const [studentCount, teacherCount, communityCount, trainingCount] = await Promise.all([
                models.Student.count(),
                models.Teacher.count(),
                models.Community.count({ where: { isAccepted: true } }),
                models.Training.count()
            ]);
            res.json({
                success: true,
                data: {
                    studentCount,
                    teacherCount,
                    communityCount,
                    trainingCount
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در دریافت آمار داشبورد', error: error.message });
        }
    }
}

module.exports = new SettingController();
