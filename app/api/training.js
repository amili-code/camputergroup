const { models } = require('../config/models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

class TrainingController {
    // CREATE - ایجاد شاخه یا زیرشاخه
    async createCategory(req, res) {
        try {
            const { title, parentId, description } = req.body;
            let filePath = null;
            if (req.file) {
                filePath = `/files/${req.file.filename}`;
            }
            const category = await models.Training.create({
                title,
                parentId: parentId || null,
                filePath,
                description
            });
            res.status(201).json({
                success: true,
                message: 'شاخه/زیرشاخه با موفقیت ایجاد شد',
                data: category
            });
        } catch (error) {
            console.error('خطا در ایجاد شاخه:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در ایجاد شاخه',
                error: error.message
            });
        }
    }

    // READ - دریافت همه شاخه‌ها (درختی)
    async getAllCategories(req, res) {
        try {
            const categories = await models.Training.findAll();
            // تبدیل به ساختار درختی
            const buildTree = (list, parentId = null) =>
                list.filter(item => item.parentId === parentId).map(item => ({
                    ...item.toJSON(),
                    children: buildTree(list, item.id)
                }));
            const tree = buildTree(categories);
            res.json({
                success: true,
                data: tree
            });
        } catch (error) {
            console.error('خطا در دریافت شاخه‌ها:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت شاخه‌ها',
                error: error.message
            });
        }
    }

    // READ - دریافت یک شاخه با زیرشاخه‌ها
    async getCategoryById(req, res) {
        try {
            const { id } = req.params;
            const category = await models.Training.findByPk(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'شاخه یافت نشد'
                });
            }
            // دریافت زیرشاخه‌ها
            const all = await models.Training.findAll();
            const buildTree = (list, parentId) =>
                list.filter(item => item.parentId === parentId).map(item => ({
                    ...item.toJSON(),
                    children: buildTree(list, item.id)
                }));
            const tree = { ...category.toJSON(), children: buildTree(all, category.id) };
            res.json({
                success: true,
                data: tree
            });
        } catch (error) {
            console.error('خطا در دریافت شاخه:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در دریافت شاخه',
                error: error.message
            });
        }
    }

    // UPDATE - ویرایش شاخه (با امکان تغییر فایل)
    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const { title, parentId, description, filePath } = req.body;
            const category = await models.Training.findByPk(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'شاخه یافت نشد'
                });
            }
            let newFilePath = category.filePath;
            // اگر فایل جدید آپلود شده
            if (req.file) {
                // حذف فایل قبلی اگر وجود داشته باشد
                if (category.filePath) {
                    try {
                        const oldPath = path.join(__dirname, '../../public', category.filePath);
                        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                    } catch (e) { console.error('خطا در حذف فایل قبلی:', e); }
                }
                newFilePath = `/files/${req.file.filename}`;
            }
            // اگر کاربر خواست فایل را حذف کند (filePath === '')
            if (filePath === '') {
                if (category.filePath) {
                    try {
                        const oldPath = path.join(__dirname, '../../public', category.filePath);
                        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                    } catch (e) { console.error('خطا در حذف فایل قبلی:', e); }
                }
                newFilePath = null;
            }
            await category.update({
                title: title || category.title,
                parentId: parentId !== undefined ? parentId : category.parentId,
                description: description !== undefined ? description : category.description,
                filePath: req.file || filePath === '' ? newFilePath : category.filePath
            });
            res.json({
                success: true,
                message: 'شاخه با موفقیت بروزرسانی شد',
                data: category
            });
        } catch (error) {
            console.error('خطا در بروزرسانی شاخه:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در بروزرسانی شاخه',
                error: error.message
            });
        }
    }

    // DELETE - حذف شاخه (و حذف فایل)
    async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            const category = await models.Training.findByPk(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'شاخه یافت نشد'
                });
            }
            // حذف فایل اگر وجود داشته باشد
            if (category.filePath) {
                try {
                    const filePath = path.join(__dirname, '../../public', category.filePath);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                } catch (e) { console.error('خطا در حذف فایل:', e); }
            }
            await category.destroy();
            res.json({
                success: true,
                message: 'شاخه با موفقیت حذف شد'
            });
        } catch (error) {
            console.error('خطا در حذف شاخه:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در حذف شاخه',
                error: error.message
            });
        }
    }

    // SEARCH - جستجو در شاخه‌ها بر اساس عنوان
    async searchCategories(req, res) {
        try {
            const { q } = req.query;
            if (!q) {
                return res.status(400).json({
                    success: false,
                    message: 'عبارت جستجو الزامی است'
                });
            }
            const categories = await models.Training.findAll({
                where: {
                    title: { [Op.like]: `%${q}%` }
                }
            });
            res.json({
                success: true,
                data: categories
            });
        } catch (error) {
            console.error('خطا در جستجوی شاخه‌ها:', error);
            res.status(500).json({
                success: false,
                message: 'خطا در جستجوی شاخه‌ها',
                error: error.message
            });
        }
    }
}

module.exports = new TrainingController();
