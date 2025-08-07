const jwt = require("jsonwebtoken");
const { models } = require('../config/models');

class web {
    example(req, res) {
        if (req.session && req.session.admin) {
            if (req.session.admin.role === 'admin')
                if (req.session.admin.username == "mainAdmin")
                    res.render("superAdmin/main.ejs", { adminUsername: "ادمین تمام سیستم" })
                else    
                    res.render("admin/main.ejs", { adminUsername: req.session.admin.username });
            else
                res.render("community/main.ejs", { adminUsername: req.session.admin.username })
        } else {
            res.redirect("/");
        }
    }
    
    landing(req, res) {
        res.render("landing/main.ejs", {  })
    }

    coursesOne(req, res) {
        res.render("getOne/courses.ejs", {  })
    }
    newsOne(req, res) {
        res.render("getOne/news.ejs", {  })
    }
    teacherOne(req, res) {
        res.render("getOne/teacher.ejs", {  })
    }
    
    
    
    courses(req, res) {
        res.render("getAll/courses.ejs", {  })
    }
    news(req, res) {
        res.render("getAll/news.ejs", {  })
    }
    tranning(req, res) {
        res.render("getAll/tranning.ejs", {  })
    }
    community(req, res) {
        res.render("getAll/community.ejs", {  })
    }
    teachers(req, res) {
        res.render("getAll/teachers.ejs", {  })
    }
    aboutUs(req, res) {
        res.render("getAll/aboutUs.ejs", {  })
    }
    finalStudent(req, res) {
        res.render("getAll/finalStudent.ejs", {  })
    }
    groupmanager(req, res) {
        res.render("getAll/groupmanager.ejs", {  })
    }

    async teacher(req, res) {
        if (!req.session || !req.session.user) return res.redirect('/login');
        const logs = await models.Log.findAll({
            where: { userId: req.session.user.id, type: 'teacher' },
            order: [['createdAt', 'DESC']]
        });
        res.render("profile/teacher.ejs", { user: req.session.user, logs });
    }
    async student(req, res) {
        if (!req.session || !req.session.user) return res.redirect('/login');
        
        try {
            // دریافت اطلاعات دانشجو
            const student = await models.Student.findByPk(req.session.user.id);
            if (!student) {
                return res.redirect('/login');
            }

            // دریافت لاگ‌ها
            const logs = await models.Log.findAll({
                where: { userId: req.session.user.id, type: 'student' },
                order: [['createdAt', 'DESC']]
            });

            // اگر دانشجو فارغ التحصیل است، اطلاعات متا را دریافت کن
            let studentMeta = null;
            if (student.isGraduated) {
                studentMeta = await models.StudentMeta.findOne({
                    where: { studentId: student.id },
                    include: [{
                        model: models.Student,
                        as: 'Student',
                        attributes: ['id', 'firstName', 'lastName', 'studentId', 'isGraduated']
                    }]
                });
            }

            res.render("profile/student.ejs", { 
                logs, 
                student, 
                studentMeta,
                isGraduated: student.isGraduated 
            });
        } catch (error) {
            console.error('خطا در بارگذاری پروفایل دانشجو:', error);
            res.redirect('/login');
        }
    }
    
    login(req, res) {
        res.render("login/login.ejs", {  })
    }

    adminPanel(req, res) {
        if (req.session && req.session.admin) {
            res.render("admin/main.ejs", { adminUsername: req.session.admin.username });
        } else {
            res.redirect("/");
        }
    }
}


module.exports = new web();