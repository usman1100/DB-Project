let express = require("express");
let mysql = require("mysql");
let creds = require("./config.js");
let session = require("express-session");
let router = require("./router");
let morgan = require("morgan");
let cookieParser = require("cookie-parser");
let utils = require("./utils");

let app = express();

app.use(express.static(__dirname + "/public"));
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
                    return res.render("error.ejs", { errors: [""] });
                }
            }

            let password = req.body.password,
                dob = req.body.dob,
                age = utils.get_age(dob),
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
            return res.render("error", {
                errors: ["Username or Password Incorrect"],
            });
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
    if (req.session.username) {
        let q =
            `SELECT * FROM posts WHERE posted_by = "` +
            req.session.username +
            '";';

        db.query(q, [true], (errors, results, fields) => {
            return res.render("home.ejs", {
                username: req.session.username,
                posts: results,
            });
        });

        // return res.render("home.ejs", { username: req.session.username });
    } else
        return res.render("error.ejs", { errors: ["You are not logged in"] });
});

app.post("/create_post/post", (req, res) => {
    let posted_by = req.session.username;
    let date = utils.get_current_date();
    let likes = 0;
    let body = req.body.body;
    let title = req.body.title;

    let q =
        `INSERT INTO posts(posted_by, date_created, likes, body, title)
            VALUES("` +
        posted_by +
        `", "` +
        date +
        `", "` +
        likes.toString() +
        `", "` +
        body +
        `", "` +
        title +
        `");`;

    db.query(q);
    return res.redirect("/wall");
});

app.post("/search/post", (req, res) => {
    let search_username = req.body.username;
    let q1 =
        `SELECT * FROM users WHERE user_name LIKE "%` + search_username + `%";`;

    db.query(q1, [true], (errors, results, fields) => {
        if (results.length == 0)
            return res.render("error.ejs", { errors: ["No users found"] });

        console.log(results);
        return res.render("searched_users.ejs", { results: results });
    });
});

app.get("/profile/:username", (req, res) => {
    let q =
        `SELECT user_name, email, dob, age, gender,null as COL6, null as COL7, null as COL8, null as COL9, null as COL10 FROM users 
         WHERE users.user_name = "` + req.params.username + `"`

         +
         ` UNION ALL `
         +

         `SELECT null as COL1, null as COL2, null as COL3, null as COL4, null as COL5, post_id, posted_by, likes, title, body FROM posts
         WHERE posts.posted_by = "` + req.params.username + `";`
         

    db.query(q, [true], (errors, results, fields) => {
        // Formatting date into MM-DD-YYYY format
        results[0].dob = utils.get_formated_date(results[0].dob);

        return res.render("profile.ejs", { user: results });

        res.send(q);
    });
});

app.listen(8081, () => {
    console.log("Listening on localhost:8081");
});
