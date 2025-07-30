const jwt = require("jsonwebtoken");

class web {
    example(req, res) {
        if (req.session && req.session.admin) {
            res.render("admin/main.ejs", { adminUsername: req.session.admin.username });
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


    teacher(req, res) {
        res.render("profile/teacher.ejs", {  })
    }
    student(req, res) {
        res.render("profile/student.ejs", {  })
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