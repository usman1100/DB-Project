let express = require("express");
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

router.get("/error", (req, res) => {
  res.render("error.ejs");
});

router.get("/success", (req, res) => {
  res.render("success.ejs");
});

module.exports = router;
