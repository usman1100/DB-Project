let express = require("express")
let router = express.Router()



router.get("/hello", (req, res) => {

    res.send("Works doe");
    // res.render("error,ejs");

})

module.exports = router;