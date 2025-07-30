const { models } = require('../config/models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

class NewsController {
    
    // CREATE - ایجاد خبر/اطلاعیه
    async createNews(req, res) {
        try {
            const { type, title, description, tags } = req.body;
            let image = null;
            if (req.file) {
                image = `/pic/news/${req.file.filename}`;
            }
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
            // بررسی تگ انجمن
            let tagsArr = [];
            if (tags) {
                tagsArr = tags.split(',').map(t => t.trim()).filter(Boolean);
            }
            const hasAnjomanTag = tagsArr.includes('انجمن');
            if (hasAnjomanTag) {
                if (!(isRealAdmin || (req.session && req.session.admin && req.session.admin.role === 'communityAdmin'))) {
                    return res.status(403).json({ success: false, message: 'فقط مدیر انجمن یا ادمین می‌تواند خبر با تگ انجمن ایجاد کند.' });
                }
            } else {
                if (!isRealAdmin) {
                    return res.status(403).json({ success: false, message: 'فقط ادمین می‌تواند خبر بدون تگ انجمن ایجاد کند.' });
                }
            }
            const news = await models.News.create({
                type,
                title,
                description,
                image,
                isActive: true,
                tags
            });
            res.status(201).json({
                success: true,
                message: 'خبر/اطلاعیه با موفقیت ایجاد شد',
                data: news
            });
        } catch (error) {
            console.error('خطا در ایجاد خبر:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در ایجاد خبر',
                error: error.message
            });
        }
    }

    // READ - دریافت همه اخبار/اطلاعیه‌های فعال و منقضی‌نشده
    async getAllNews(req, res) {
        try {
            const news = await models.News.findAll({
                where: {
                    isActive: true
                },
                order: [['createdAt', 'DESC']]
            });
            res.json({
                success: true,
                data: news
            });
        } catch (error) {
            console.error('خطا در دریافت اخبار:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت اخبار',
                error: error.message
            });
        }
    }

    // READ - دریافت یک خبر/اطلاعیه
    async getNewsById(req, res) {
        try {
            const { id } = req.params;
            const news = await models.News.findByPk(id);
            if (!news) {
                return res.status(404).json({
                    success: false,
                    message: 'خبر/اطلاعیه یافت نشد'
                });
            }
            res.json({
                success: true,
                data: news
            });
        } catch (error) {
            console.error('خطا در دریافت خبر:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت خبر',
                error: error.message
            });
        }
    }

    // UPDATE - ویرایش خبر/اطلاعیه (با امکان تغییر یا حذف تصویر)
    async updateNews(req, res) {
        try {
            const { id } = req.params;
            const { type, title, description, tags, image, isActive } = req.body;
            const news = await models.News.findByPk(id);
            if (!news) {
                return res.status(404).json({
                    success: false,
                    message: 'خبر/اطلاعیه یافت نشد'
                });
            }
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
            // بررسی تگ انجمن قبلی
            let oldTagsArr = [];
            if (news.tags) {
                oldTagsArr = news.tags.split(',').map(t => t.trim()).filter(Boolean);
            }
            const hadAnjomanTag = oldTagsArr.includes('انجمن');
            // بررسی تگ جدید (در صورت تغییر)
            let newTagsArr = oldTagsArr;
            if (tags) {
                newTagsArr = tags.split(',').map(t => t.trim()).filter(Boolean);
            }
            const hasAnjomanTag = newTagsArr.includes('انجمن');
            // شرط دسترسی: اگر قبلاً انجمن داشت فقط مدیر انجمن یا ادمین بتواند و اگر نداشت فقط ادمین
            if (hadAnjomanTag || hasAnjomanTag) {
                if (!(isRealAdmin || (req.session && req.session.admin && req.session.admin.role === 'communityAdmin'))) {
                    return res.status(403).json({ success: false, message: 'فقط مدیر انجمن یا ادمین می‌تواند خبر با تگ انجمن را ویرایش کند.' });
                }
            } else {
                if (!isRealAdmin) {
                    return res.status(403).json({ success: false, message: 'فقط ادمین می‌تواند خبر بدون تگ انجمن را ویرایش کند.' });
                }
            }
            // اگر خبر قبلاً تگ انجمن نداشته و مدیر انجمن می‌خواهد تگ انجمن اضافه کند، اجازه نده
            if (!hadAnjomanTag && hasAnjomanTag && !isRealAdmin && req.session && req.session.admin && req.session.admin.role === 'communityAdmin') {
                return res.status(403).json({ success: false, message: 'مدیر انجمن نمی‌تواند تگ انجمن را به خبرهایی که قبلاً نداشته‌اند اضافه کند.' });
            }
            let newImage = news.image;
            if (req.file) {
                if (news.image) {
                    try {
                        const oldPath = path.join(__dirname, '../../public', news.image);
                        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                    } catch (e) { console.error('خطا در حذف تصویر قبلی:', e); }
                }
                newImage = `/pic/news/${req.file.filename}`;
            }
            if (image === '') {
                if (news.image) {
                    try {
                        const oldPath = path.join(__dirname, '../../public', news.image);
                        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                    } catch (e) { console.error('خطا در حذف تصویر قبلی:', e); }
                }
                newImage = null;
            }
            await news.update({
                type: type || news.type,
                title: title || news.title,
                description: description || news.description,
                image: req.file || image === '' ? newImage : news.image,
                isActive: isActive !== undefined ? isActive : news.isActive,
                tags: tags || news.tags
            });
            res.json({
                success: true,
                message: 'خبر/اطلاعیه با موفقیت بروزرسانی شد',
                data: news
            });
        } catch (error) {
            console.error('خطا در بروزرسانی خبر:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در بروزرسانی خبر',
                error: error.message
            });
        }
    }

    // DELETE - حذف خبر/اطلاعیه
    async deleteNews(req, res) {
        try {
            const { id } = req.params;
            const news = await models.News.findByPk(id);
            if (!news) {
                return res.status(404).json({
                    success: false,
                    message: 'خبر/اطلاعیه یافت نشد'
                });
            }
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
            // بررسی تگ انجمن
            let tagsArr = [];
            if (news.tags) {
                tagsArr = news.tags.split(',').map(t => t.trim()).filter(Boolean);
            }
            const hasAnjomanTag = tagsArr.includes('انجمن');
            if (hasAnjomanTag) {
                if (!(isRealAdmin || (req.session && req.session.admin && req.session.admin.role === 'communityAdmin'))) {
                    return res.status(403).json({ success: false, message: 'فقط مدیر انجمن یا ادمین می‌تواند خبر با تگ انجمن را حذف کند.' });
                }
            } else {
                if (!isRealAdmin) {
                    return res.status(403).json({ success: false, message: 'فقط ادمین می‌تواند خبر بدون تگ انجمن را حذف کند.' });
                }
            }
            if (news.image) {
                try {
                    const filePath = path.join(__dirname, '../../public', news.image);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                } catch (e) { console.error('خطا در حذف تصویر:', e); }
            }
            await news.destroy();
            res.json({
                success: true,
                message: 'خبر/اطلاعیه با موفقیت حذف شد'
            });
        } catch (error) {
            console.error('خطا در حذف خبر:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در حذف خبر',
                error: error.message
            });
        }
    }

    // SEARCH - جستجو بر اساس عنوان یا تگ
    async searchNews(req, res) {
        try {
            const { q } = req.query;
            if (!q) {
                return res.status(400).json({
                    success: false,
                    message: 'عبارت جستجو الزامی است'
                });
            }
            const news = await models.News.findAll({
                where: {
                    isActive: true,
                    [Op.or]: [
                        { title: { [Op.like]: `%${q}%` } },
                        { tags: { [Op.like]: `%${q}%` } }
                    ]
                },
                order: [['createdAt', 'DESC']]
            });
            res.json({
                success: true,
                data: news
            });
        } catch (error) {
            console.error('خطا در جستجوی خبر:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در جستجوی خبر',
                error: error.message
            });
        }
    }

    // POLL: ایجاد سوال و گزینه‌های نظرسنجی برای اطلاعیه
    async createPoll(req, res) {
        try {
            const { newsId, question, options } = req.body;
            if (!newsId || !question || !Array.isArray(options) || options.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'newsId، سوال و حداقل یک گزینه الزامی است'
                });
            }
            // بررسی وجود اطلاعیه
            const news = await models.News.findByPk(newsId);
            if (!news) {
                return res.status(404).json({
                    success: false,
                    message: 'اطلاعیه یافت نشد'
                });
            }
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
            // بررسی تگ انجمن
            let tagsArr = [];
            if (news.tags) {
                tagsArr = news.tags.split(',').map(t => t.trim()).filter(Boolean);
            }
            const hasAnjomanTag = tagsArr.includes('انجمن');
            if (hasAnjomanTag) {
                if (!(isRealAdmin || (req.session && req.session.admin && req.session.admin.role === 'communityAdmin'))) {
                    return res.status(403).json({ success: false, message: 'فقط مدیر انجمن یا ادمین می‌تواند برای خبر با تگ انجمن نظرسنجی ایجاد کند.' });
                }
            } else {
                if (!isRealAdmin) {
                    return res.status(403).json({ success: false, message: 'فقط ادمین می‌تواند برای خبر بدون تگ انجمن نظرسنجی ایجاد کند.' });
                }
            }
            // ایجاد سوال
            const pollQuestion = await models.PollQuestion.create({
                newsId,
                question
            });
            // ایجاد گزینه‌ها
            const pollOptions = await Promise.all(options.map(optionText =>
                models.PollOption.create({ pollQuestionId: pollQuestion.id, optionText })
            ));
            res.status(201).json({
                success: true,
                message: 'سوال و گزینه‌های نظرسنجی با موفقیت ثبت شد',
                data: {
                    pollQuestion,
                    pollOptions
                }
            });
        } catch (error) {
            console.error('خطا در ایجاد نظرسنجی:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در ایجاد نظرسنجی',
                error: error.message
            });
        }
    }

    // POLL: دریافت سوالات و گزینه‌های نظرسنجی یک اطلاعیه
    async getPollByNewsId(req, res) {
        try {
            const { newsId } = req.params;
            // دریافت همه سوالات این اطلاعیه
            const questions = await models.PollQuestion.findAll({
                where: { newsId },
                order: [['id', 'ASC']]
            });
            // دریافت گزینه‌های هر سوال
            const pollData = await Promise.all(questions.map(async q => {
                const options = await models.PollOption.findAll({
                    where: { pollQuestionId: q.id },
                    order: [['id', 'ASC']]
                });
                return {
                    id: q.id,
                    question: q.question,
                    options: options.map(o => ({ id: o.id, optionText: o.optionText }))
                };
            }));
            res.json({
                success: true,
                data: pollData
            });
        } catch (error) {
            console.error('خطا در دریافت نظرسنجی:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت نظرسنجی',
                error: error.message
            });
        }
    }

    // POLL: حذف یک سوال نظرسنجی و تمام گزینه‌هایش
    async deletePollQuestion(req, res) {
        try {
            const { pollQuestionId } = req.params;
            // پیدا کردن سوال
            const pollQuestion = await models.PollQuestion.findByPk(pollQuestionId);
            if (!pollQuestion) {
                return res.status(404).json({
                    success: false,
                    message: 'سوال نظرسنجی یافت نشد'
                });
            }
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
            // بررسی تگ انجمن خبر مربوطه
            const news = await models.News.findByPk(pollQuestion.newsId);
            if (news) {
                let tagsArr = [];
                if (news.tags) {
                    tagsArr = news.tags.split(',').map(t => t.trim()).filter(Boolean);
                }
                const hasAnjomanTag = tagsArr.includes('انجمن');
                if (hasAnjomanTag) {
                    if (!(isRealAdmin || (req.session && req.session.admin && req.session.admin.role === 'communityAdmin'))) {
                        return res.status(403).json({ success: false, message: 'فقط مدیر انجمن یا ادمین می‌تواند نظرسنجی خبر با تگ انجمن را حذف کند.' });
                    }
                } else {
                    if (!isRealAdmin) {
                        return res.status(403).json({ success: false, message: 'فقط ادمین می‌تواند نظرسنجی خبر بدون تگ انجمن را حذف کند.' });
                    }
                }
            }
            // حذف همه گزینه‌های این سوال
            await models.PollOption.destroy({ where: { pollQuestionId } });
            // حذف خود سوال
            await pollQuestion.destroy();
            res.json({
                success: true,
                message: 'سوال نظرسنجی و گزینه‌هایش با موفقیت حذف شد'
            });
        } catch (error) {
            console.error('خطا در حذف سوال نظرسنجی:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در حذف سوال نظرسنجی',
                error: error.message
            });
        }
    }
}

module.exports = new NewsController();
