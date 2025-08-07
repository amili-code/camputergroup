const { models } = require('../config/models');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

class AdminController{
    async getAllAdmins(req, res) {
        try {
            const admins = await models.Admin.findAll();
            res.json(admins);
        } catch (err) {
            res.status(500).json({ message: 'خطا در واکشی لیست ادمین‌ها', error: err.message });
        }
    }

    async getAdminById(req, res) {
        try {
            const admin = await models.Admin.findByPk(req.params.id);
            if (!admin) return res.status(404).json({ message: 'ادمین یافت نشد' });
            res.json(admin);
        } catch (err) {
            res.status(500).json({ message: 'خطا در واکشی ادمین', error: err.message });
        }
    }

    async createAdmin(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) return res.status(400).json({ message: 'نام کاربری و رمز عبور الزامی است' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const admin = await models.Admin.create({ username, password: hashedPassword });

            res.status(201).json({ message: 'ادمین با موفقیت ایجاد شد', admin });
        } catch (err) {
            res.status(500).json({ message: 'خطا در ایجاد ادمین', error: err.message });
        }
    }
    async updateAdmin(req, res) {
        try {
            const { id } = req.params;
            const { username, password } = req.body;

            const admin = await models.Admin.findByPk(id);
            if (!admin) return res.status(404).json({ message: 'ادمین یافت نشد' });

            const updatedData = {};
            if (username) updatedData.username = username;
            if (password) updatedData.password = await bcrypt.hash(password, 10);

            await admin.update(updatedData);
            res.json({ message: 'ادمین با موفقیت به‌روزرسانی شد', admin });

        } catch (err) {
            res.status(500).json({ message: 'خطا در به‌روزرسانی ادمین', error: err.message });
        }
    }
    async deleteAdmin(req, res) {
        try {
            const admin = await models.Admin.findByPk(req.params.id);
            if (!admin) return res.status(404).json({ message: 'ادمین یافت نشد' });
            if (admin.username == "mainAdmin")
                return res.status(403).json({message:"ادمین سراسری قابل حذف نمی باشد!"})

            const groupAdminPath = path.join(__dirname, 'groupAdmin.json');
            let groupAdmins = [];
            if (fs.existsSync(groupAdminPath)) {
                const data = fs.readFileSync(groupAdminPath, 'utf-8');
                groupAdmins = data ? JSON.parse(data) : [];
            }

            const removeFromGroup = req.body.removeFromGroup;
            if (!removeFromGroup) {
                groupAdmins.push({
                    username: admin.username,
                    createdAt: admin.createdAt,
                    deletedAt: new Date()
                });
                fs.writeFileSync(groupAdminPath, JSON.stringify(groupAdmins, null, 2));
            }

            await admin.destroy();
            res.json({ message: 'ادمین با موفقیت حذف شد' });

        } catch (err) {
            res.status(500).json({ message: 'خطا در حذف ادمین', error: err.message });
        }
    }
    async getGroupAdmins(req, res) {
        try {
            // بخش تاریخچه
            const groupAdminPath = path.join(__dirname, 'groupAdmin.json');
            let groupAdminsHistory = [];
            if (fs.existsSync(groupAdminPath)) {
                const data = fs.readFileSync(groupAdminPath, 'utf-8');
                groupAdminsHistory = data ? JSON.parse(data) : [];
            }
            // بخش ادمین‌های فعلی
            const admins = await models.Admin.findAll({
                attributes: ['username', 'createdAt'],
                where: {
                  username: {
                    [Op.ne]: 'mainAdmin' // یعنی username نباشه برابر با 'mainAdmin'
                  }
                }
              });
              res.json({
                current: admins,
                history: groupAdminsHistory
            });
        } catch (err) {
            res.status(500).json({ message: 'خطا در دریافت لیست مدیران گروه', error: err.message });
        }
    }
    
}

module.exports = new AdminController();
