const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const { models } = require('../config/models');
const { logUserAction } = require('../config/loger');

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
    // GET - دریافت لاگ ها
    async getLogs(req, res) {
        try {
            const logs = await models.Log.findAll({
                order: [['createdAt', 'DESC']]
            });
            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            console.error('خطا در دریافت لاگ ها:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت لاگ ها',
                error: error.message
            });
        }
    }

    // GET - دریافت لاگ های یک استاد خاص
    async getTeacherLogs(req, res) {
        try {
            const { teacherId } = req.params;
            
            const logs = await models.Log.findAll({
                where: {
                    userId: teacherId,
                    type: 'teacher'
                },
                order: [['createdAt', 'DESC']]
            });
            
            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            console.error('خطا در دریافت لاگ های استاد:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت لاگ های استاد',
                error: error.message
            });
        }
    }
    // PUT - ویرایش کل تنظیمات
    async updateSettings(req, res) {
        try {
            const newSettings = req.body;
            await fs.writeFile(SETTING_PATH, JSON.stringify(newSettings, null, 2), 'utf-8');

            // ثبت لاگ
            await logUserAction(req, 'تنظیمات سایت را ویرایش کرد');

            res.json({ success: true, message: 'تنظیمات با موفقیت ذخیره شد.' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در ذخیره تنظیمات', error: error.message });
        }
    }

    // POST - آپلود لوگو جدید
    async uploadLogo(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'فایل لوگو ارسال نشده است.' });
            }

            const logoPath = `/pic/settings/${req.file.filename}`;
            const data = await fs.readFile(SETTING_PATH, 'utf-8');
            const settings = JSON.parse(data);

            // حذف لوگوی قبلی اگر وجود دارد
            if (settings.logo && settings.logo !== '/pic/settings/logo-default.png') {
                try {
                    const oldLogoPath = path.join(__dirname, '../../public', settings.logo);
                    if (fsSync.existsSync(oldLogoPath)) {
                        fsSync.unlinkSync(oldLogoPath);
                    }
                } catch (e) {
                    console.log('خطا در حذف لوگوی قبلی:', e.message);
                }
            }

            // بروزرسانی مسیر لوگو
            settings.logo = logoPath;
            await fs.writeFile(SETTING_PATH, JSON.stringify(settings, null, 2), 'utf-8');

            // ثبت لاگ
            await logUserAction(req, 'لوگوی جدید سایت را آپلود کرد');

            res.json({ success: true, message: 'لوگو با موفقیت آپلود شد.', logoPath });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در آپلود لوگو', error: error.message });
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

            // ثبت لاگ
            await logUserAction(req, `عکس جدید با عنوان "${title}" به گالری اضافه کرد`);

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

    // ==================== SITE ABOUT US METHODS ====================
    
    // POST - ایجاد بخش جدید درباره ما
    async createAboutUsSection(req, res) {
        try {
            const { type, description, textContent, order } = req.body;
            let imagePath = null;
            let filePath = null;

            if (req.file) {
                const relativePath = req.file.mimetype.startsWith('image/') ? 
                    `/pic/settings/${req.file.filename}` : 
                    `/files/settings/${req.file.filename}`;
                if (type === 'image') imagePath = relativePath;
                else if (type === 'file') filePath = relativePath;
            }

            const data = await fs.readFile(SETTING_PATH, 'utf-8');
            const settings = JSON.parse(data);
            settings.aboutUs = settings.aboutUs || [];

            const newSection = {
                id: Date.now(),
                type,
                description,
                textContent: type === 'text' ? textContent : null,
                imagePath,
                filePath,
                order: order || settings.aboutUs.length + 1
            };

            settings.aboutUs.push(newSection);
            await fs.writeFile(SETTING_PATH, JSON.stringify(settings, null, 2), 'utf-8');

            res.json({ success: true, data: newSection });
        } catch (error) {
            console.error('Create about us section error:', error);
            res.status(500).json({ success: false, message: 'خطا در ایجاد بخش', error: error.message });
        }
    }

    // GET - دریافت همه بخش‌های درباره ما
    async getAllAboutUsSections(req, res) {
        try {
            const data = await fs.readFile(SETTING_PATH, 'utf-8');
            const settings = JSON.parse(data);
            const sections = (settings.aboutUs || []).sort((a, b) => a.order - b.order);
            res.json({ success: true, data: sections });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در دریافت بخش‌ها', error: error.message });
        }
    }

    // GET - دریافت یک بخش خاص
    async getAboutUsSection(req, res) {
        try {
            const { id } = req.params;
            const data = await fs.readFile(SETTING_PATH, 'utf-8');
            const settings = JSON.parse(data);
            const section = (settings.aboutUs || []).find(s => s.id == id);
            
            if (!section) {
                return res.status(404).json({ success: false, message: 'بخش یافت نشد' });
            }
            
            res.json({ success: true, data: section });
        } catch (error) {
            res.status(500).json({ success: false, message: 'خطا در دریافت بخش', error: error.message });
        }
    }

    // PUT - ویرایش بخش
    async updateAboutUsSection(req, res) {
        try {
            const { id } = req.params;
            const { type, description, textContent, order } = req.body;
            
            const data = await fs.readFile(SETTING_PATH, 'utf-8');
            const settings = JSON.parse(data);
            const sectionIndex = (settings.aboutUs || []).findIndex(s => s.id == id);
            
            if (sectionIndex === -1) {
                return res.status(404).json({ success: false, message: 'بخش یافت نشد' });
            }

            const section = settings.aboutUs[sectionIndex];
            let newImagePath = section.imagePath;
            let newFilePath = section.filePath;

            if (req.file) {
                const relativePath = req.file.mimetype.startsWith('image/') ? 
                    `/pic/settings/${req.file.filename}` : 
                    `/files/settings/${req.file.filename}`;

                // حذف فایل قبلی اگر وجود دارد
                if (section.imagePath && type === 'image') {
                    const full = path.join(__dirname, '../../public', section.imagePath);
                    if (fsSync.existsSync(full)) fsSync.unlinkSync(full);
                    newImagePath = relativePath;
                } else if (section.filePath && type === 'file') {
                    const full = path.join(__dirname, '../../public', section.filePath);
                    if (fsSync.existsSync(full)) fsSync.unlinkSync(full);
                    newFilePath = relativePath;
                }

                if (type === 'image') newImagePath = relativePath;
                if (type === 'file') newFilePath = relativePath;
            }

            settings.aboutUs[sectionIndex] = {
                ...section,
                type,
                description,
                textContent: type === 'text' ? textContent : null,
                imagePath: type === 'image' ? newImagePath : null,
                filePath: type === 'file' ? newFilePath : null,
                order: order || section.order
            };

            await fs.writeFile(SETTING_PATH, JSON.stringify(settings, null, 2), 'utf-8');
            res.json({ success: true, message: 'بروزرسانی با موفقیت انجام شد', data: settings.aboutUs[sectionIndex] });
        } catch (error) {
            console.error('Update about us section error:', error);
            res.status(500).json({ success: false, message: 'خطا در بروزرسانی بخش', error: error.message });
        }
    }

    // DELETE - حذف بخش
    async deleteAboutUsSection(req, res) {
        try {
            const { id } = req.params;
            const data = await fs.readFile(SETTING_PATH, 'utf-8');
            const settings = JSON.parse(data);
            const sectionIndex = (settings.aboutUs || []).findIndex(s => s.id == id);
            
            if (sectionIndex === -1) {
                return res.status(404).json({ success: false, message: 'بخش یافت نشد' });
            }

            const section = settings.aboutUs[sectionIndex];

            // حذف فایل‌ها اگر وجود دارد
            if (section.imagePath) {
                const full = path.join(__dirname, '../../public', section.imagePath);
                if (fsSync.existsSync(full)) fsSync.unlinkSync(full);
            }
            if (section.filePath) {
                const full = path.join(__dirname, '../../public', section.filePath);
                if (fsSync.existsSync(full)) fsSync.unlinkSync(full);
            }

            settings.aboutUs.splice(sectionIndex, 1);
            await fs.writeFile(SETTING_PATH, JSON.stringify(settings, null, 2), 'utf-8');
            
            res.json({ success: true, message: 'بخش حذف شد' });
        } catch (error) {
            console.error('Delete about us section error:', error);
            res.status(500).json({ success: false, message: 'خطا در حذف بخش', error: error.message });
        }
    }

    // PATCH - تغییر ترتیب بخش‌ها
    async reorderAboutUsSections(req, res) {
        try {
            const { sections } = req.body; // آرایه‌ای از {id, order}
            
            if (!Array.isArray(sections)) {
                return res.status(400).json({ success: false, message: 'داده‌های نامعتبر' });
            }

            const data = await fs.readFile(SETTING_PATH, 'utf-8');
            const settings = JSON.parse(data);
            
            // بروزرسانی ترتیب همه بخش‌ها
            sections.forEach(({ id, order }) => {
                const sectionIndex = settings.aboutUs.findIndex(s => s.id == id);
                if (sectionIndex !== -1) {
                    settings.aboutUs[sectionIndex].order = order;
                }
            });

            // مرتب کردن بر اساس ترتیب
            settings.aboutUs.sort((a, b) => a.order - b.order);

            await fs.writeFile(SETTING_PATH, JSON.stringify(settings, null, 2), 'utf-8');
            res.json({ success: true, message: 'ترتیب با موفقیت تغییر کرد' });
        } catch (error) {
            console.error('Reorder about us sections error:', error);
            res.status(500).json({ success: false, message: 'خطا در تغییر ترتیب', error: error.message });
        }
    }
}

module.exports = new SettingController();
