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
