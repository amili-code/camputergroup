const jwt = require("jsonwebtoken");

class web {
    example(req, res) {
        res.render("admin/main.ejs", {  })
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
}


module.exports = new web();