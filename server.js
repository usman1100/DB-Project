let express = require("express");
let mysql = require("mysql");
let creds = require("./config.js");
let session = require("express-session");
let router = require("./router");
let morgan = require("morgan");
let cookieParser = require("cookie-parser");

let app = express();

app.use(cookieParser("pp"));
app.use(
  session({
    secret: "pp",
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/", router);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

let db = mysql.createConnection(creds);

db.connect((err) => {
  if (err) {
    throw err;
  }

  console.log("Connected");
});

app.post("/register/post", (req, res) => {
  let username = req.body.user_name;
  let email = req.body.email;

  db.query(
    "SELECT user_name, email FROM users",
    [true],
    (errors, results, fields) => {
      if (results.length > 0) {
        let usernames = results.map((user) => user.user_name);
        let emails = results.map((user) => user.email);

        if (usernames.includes(username) || emails.includes(email)) {
          return res.render("error.ejs");
        }
      }

      let password = req.body.password,
        dob = req.body.dob,
        age = 0,
        gender = req.body.gender;

      let q =
        `INSERT INTO users(user_name, email, pass, dob, age, gender)
           VALUES("` +
        username +
        `", "` +
        email +
        `", "` +
        password +
        `", "` +
        dob +
        `", "` +
        age.toString() +
        `", "` +
        gender +
        `");`;

      db.query(q);
      return res.redirect("/success");
    }
  );
});

app.post("/login/post", (req, res) => {
  let username = req.body.user_name;
  let password = req.body.password;
  let q =
    `SELECT user_name, pass from users
          WHERE user_name = "` +
    username +
    `" AND pass = "` +
    password +
    `";`;
  db.query(q, [true], (errors, results, fields) => {
    if (results.length != 1) {
      return res.redirect("/error");
    }

    req.session.username = username;
    console.log(results);

    return res.redirect("/home");
  });
});

app.get("/logout", (req, res) => {
  req.session.username = undefined;
  res.redirect("/login");
});

app.get("/home", (req, res) => {
  if (req.session.username){
    console.log(req.body);
    return res.render("home.ejs", { username: req.session.username });
  }
  else return res.redirect("/error");
});

app.get("/wall", (req, res) => {

  let q = `SELECT * FROM posts WHERE posted_by = "`+ req.session.username + '";';

  db.query(q, [true], (errors, results, fields) =>{

    res.render("wall.ejs", {posts:results})


  })


})


app.listen(8081, () => {
  console.log("Listening on localhost:8081");
});
