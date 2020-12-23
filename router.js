const { renderFile } = require("ejs");
let express = require("express");
let session = require("express-session")
let router = express.Router();

router.get("/hello", (req, res) => {
  res.send("Works doe");
  // res.render("error,ejs");
});

router.get("/", (req, res) => {
  res.render("index.ejs");
});

router.get("/register", (req, res) => {
  res.render("register.ejs");
});

router.get("/login", (req, res) => {
  res.render("login.ejs");
});

router.get("/error", (req, res) => {
  res.render("error.ejs", {errors:[]});
});

router.get("/success", (req, res) => {
  res.render("success.ejs");
});

router.get("/create_post", (req, res) => {

  res.render("create_post.ejs");

})


router.get("/search", (req, res)=>{

  if(req.session.username)
    return res.render("search.ejs");

  return res.render("error.ejs", {errors:["Cant search. User not logged in"]});
  

})
module.exports = router;
