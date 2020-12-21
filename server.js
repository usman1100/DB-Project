let express = require("express");
let mysql = require("mysql");
let creds = require("./config.js");
let session = require("express-session");
let router = require("./router");
let morgan = require("morgan");

let app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "pp",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);
app.use("/", router);
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
        console.log(emails);

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

app.listen(8081, () => {
  console.log("Listening on localhost:8081");
});
