const jwt = require("jsonwebtoken");

class web {
    example(req, res) {
        res.render("admin/main.ejs", {  })
    }
}


module.exports = new web();