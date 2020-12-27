let express = require("express");
let mysql = require("mysql");
let creds = require("./config.js");
let session = require("express-session");
let router = require("./router");
let morgan = require("morgan");
let cookieParser = require("cookie-parser");
let sqlString = require("sqlstring")
let utils = require("./utils");
let Filter = require("bad-words")

// Filter object for filtering profanitites
let filter = new Filter();

// App is the main object of the server
let app = express();

// Middlewares
app.use(express.static(__dirname + "/public")); // For static files
app.use(cookieParser("pp")); // For parsing cookies
app.use(
    session({
        secret: "pp",
        resave: false,
        saveUninitialized: true,
    })
); // For sessions
app.use("/", router); // For the router.js file
app.set("view engine", "ejs"); // For using EJS templates
app.use(express.urlencoded({ extended: false })); // URL encoding
app.use(morgan("dev")); // For monitoring all requests in console


// The db object is responsible for
// connecting to the MySql Database
// and making all the queries
let db = mysql.createConnection(creds);


// Making database connections
db.connect((err) => {
    if (err) {
        throw err;
    }

    console.log("Connected");
});


// POST requests for registering new user
app.post("/register/post", (req, res) => {
    
    // username and email are extracted
    // from req.body object recieved from a form
    let username = req.body.user_name;
    let email = req.body.email;

    // querying the DB for all usernames 
    // and emails to check if a username
    // or email is already in use
    db.query(
        "SELECT user_name, email FROM users",
        [true],
        (errors, results, fields) => {

            // If the results object's length
            // is greater than 0, it mean that
            // there are some users registered in the DB
            if (results.length > 0) {

                // usernames object contains a list of
                // all the usernames in the DB 
                let usernames = results.map((user) => user.user_name);

                // emails object contains a list of
                // all the emails in the DB 
                let emails = results.map((user) => user.email);


                // This if statement checks if our username OR email (obtained from the form)
                // is present in usernames OR emails list respectively

                if (usernames.includes(username) || emails.includes(email)) {
                    return res.render("error.ejs", { errors: ["Username or email already in use"] });
                }

            }

            // Getting password, date of birth(dob) and gender from req.body
            let password = req.body.password,
                dob = req.body.dob,
                age = utils.get_age(dob), // Age is calcluated from dob using get_age() method
                gender = req.body.gender;


            // The query string
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


            // Another query that is executed inside
            // the body of the previous query function
            db.query(q);

            // Redirect to a success page
            return res.redirect("/success");
        }
    );
});


// POST requesting for signing in
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

        return res.redirect("/home");
    });
});


// When a user wants to logout
app.get("/logout", (req, res) => {
    // When a user is logged out, the session
    // username is made undefined again
    req.session.username = undefined;

    // Refirect to login page
    res.redirect("/login");

});


// Go to home page of currently logged user profile
app.get("/home", (req, res) => {

    // If session.username exists, ie
    // if a user is currently logged in
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
    } 
    // If no user is logged in
    else
        return res.render("error.ejs", { errors: ["You are not logged in"] });
});

// POST request for creating new "post" in DB
app.post("/create_post/post", (req, res) => {
    
    // Username is sessions username
    let posted_by = req.session.username;

    // A function that returns todays date in YYYY-MM-DD format
    let date = utils.get_current_date();

    // Set likes of a new post to 0
    let likes = 0;

    // req.body is the object recieved from a form
    // who has sent us at this URL

    // req.body.body is parsed into a string object
    let body = String(req.body.body);

    body = filter.clean(body); //Cleaning out profanities

    // req.body.title is also parsed into a string object
    let title = String(req.body.title);

    title = filter.clean(title); // Profanity cleaning

    // q is the the naming convention for the 
    // object in which the query string is stored

    // INSERTing a new post in the posts table
    let q =
        `INSERT INTO posts(posted_by, date_created, likes, body, title)
            VALUES("` +
        posted_by +
        `", "` +
        date +
        `", "` +
        likes.toString() +
        `", "` +

        // sqlString.escape is used to clean sql strings to prevent
        // errors and sql injections

        sqlString.escape(body) +
        `", "` +

        // Another clean up
        sqlString.escape(title) +
        `");`;



    // db.query is used to execute a query
    db.query(q);

    // After the query is done, redirect to home
    return res.redirect("/home");
});

// POST request for searching a user
app.post("/search/post", (req, res) => {

    // User name is obtained from req.body object
    let search_username = req.body.username;

    // Query string is stored in q
    let q =
    `SELECT * FROM users WHERE user_name LIKE "%` + search_username + `%";`;

    // Querying the database again with the same
    // db.query() function
    // The reason it seems different from above is because
    // we are not getting results back from the query too
    // The "results" object contains query results in the form
    // of a list of objects
    // If a query fetches no reults, empty string is returned
    db.query(q, [true], (errors, results, fields) => {

        return res.render("searched_users.ejs", { results: results });

    });
});

// GET request for accessing another 
// user's info
app.get("/profile/:username", (req, res) => {

    // This is UNION query
    // We are trying to get user info from users table
    // as well as their posts from posts table
    // Since their column numbers are different
    // we have to use null columns to fill in the gaps
    let q =
        `SELECT user_name, email, dob, age, gender,null as post_id, null as posted_by, null as likes, null as title, null as body FROM users 
         WHERE users.user_name = "` + req.params.username + `"`

         +
         ` UNION ALL `
         +

         `SELECT null as COL1, null as COL2, null as COL3, null as COL4, null as COL5, post_id, posted_by, likes, title, body FROM posts
         WHERE posts.posted_by = "` + req.params.username + `";`
         

    db.query(q, [true], (errors, results, fields) => {

        // reuslts list's first element 
        // contains user info
        // and the rest are posts

        // Formatting date into MM-DD-YYYY format
        results[0].dob = utils.get_formated_date(results[0].dob);

        // Render the porfile page with the results list
        return res.render("profile.ejs", { user: results });
    });
});

// GET request for acessing a single post
app.get("/post/:postid", (req, res)=>{

    // Checks is a user is logged in
    if(req.session.username){
    let postid = req.params.postid;

    // Another UNION query
    let q = 
    `
    SELECT posted_by , post_id , date_created , body ,null as post_title, NULL as post_likes FROM comments 
    WHERE post_id = ` + postid
    +
    ` UNION ALL `
    +
    `
    SELECT posted_by , post_id , date_created , body, title, likes  FROM posts 
    WHERE post_id = ` + postid
    
    + `;`;

    db.query(q, [true], (errors, results, fields) => {

        // Separating the reulsts for the UNION query
        // into two parts, post info and comments on that post
        let data = utils.separate_post_comments(results);
        return res.render("post.ejs", data);


    })
    }
    else
        return res.render("error.ejs", {errors:["Youre not logged in"]})


} )


app.post("/comment/:postid", (req, res)=>{

    // Checks is a user is logged in
    if(req.session.username){

    let body = req.body.body;
    let postid = req.body.postid;

    let posted_by = req.session.username;
    let date_created = utils.get_current_date(); // Gets todays date

    body = filter.clean(body); // Clean the sql syntax

    let q = 
    `
    INSERT INTO comments(posted_by, post_id, body, date_created)
    VALUES 
    (`
    + `"` + posted_by + `", `
    + postid + `, `
    + `"` + body + `", `
    + `"` + date_created
    
    + `");`

    db.query(q);

    res.redirect("/post/" + postid);
    }

    else
    {
        res.render("error.ejs", {errors:["Youre not logged in"]})
    }


})

// POST request to send a like
app.post("/like/:postid", (req, res) => {

    let postid = req.body.postid[0];
    let q =
    `
    UPDATE posts
    SET likes = likes + 1
    WHERE post_id = 
    `
     + postid + `;`


     db.query(q);

     res.redirect("/post/" + postid);

})

app.listen(8081, () => {
    console.log("Listening on localhost:8081");
});
