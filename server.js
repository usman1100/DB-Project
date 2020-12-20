let express = require("express");
let mysql = require("mysql");
let creds = require("./config.js");
let session = require("express-session");
let date_to_age = require("./utils")

let app = express();


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(session({
	secret: 'pp',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: true }
  }))

let db = mysql.createConnection(creds);


db.connect((err) => {
  if (err) {
    throw err;
  }

  console.log("Connected");
});


app.get("/", (req, res)=>{
  res.render("index.ejs");
})

app.get("/register", (req, res) => {
  res.render("register.ejs")
})

app.get("/error", (req, res) => {
  res.render("error.ejs")
})

app.get("/success", (req, res) => {
  res.render("success.ejs")
})





app.post("/register/post", (req, res) => {

  console.log(req.body);
  let username = req.body.user_name;
  // db.query("SELECT user_name FROM users", [true], (errors, results, fields) => {

  //   console.log(username);
  //   console.log(results);

  // })

  let password = req.body.password,
      email = req.body.email,
      dob = req.body.dob,
      age = 0,
      gender = req.body.gender;

  let q = `INSERT INTO users(user_name, email, pass, dob, age, gender)
           VALUES("`
           + username + `", "`
           + email + `", "` 
           + password + `", "`
           + dob + `", "`
           + age.toString() + `", "`
           + gender + 
           `");`
  
  db.query(q, [true], (errors, results, fields)=>{

    if(errors)
      if(errors.code == "ER_DUP_ENTRY"  )
        res.redirect("/error")


    else
    {
      res.redirect("/success")
    }

    res.redirect("/success")
  });

})

// app.post("/submit/data/", (req, res) => {
//   let title = req.body.title;
//   let body = req.body.body;

//   let q =
//     `INSERT INTO posts(title, body)
//              VALUES("` +
//     title +
//     `", "` +
//     body +
//     ` ");`;
//   res.render("index.ejs");
//   db.query(q);
//   res.send(title + " " + body);
// });

// app.get("/posts/", (req, res) => {
//   q = "SELECT * FROM posts";
//   db.query(q, [true], (error, results, fields) => {
//     if (error) {
//       res.send("error");
//     }

//     console.log(results);

//     let data = { results: results };

//     res.render("posts.ejs", data);
//   });
// });


app.listen(8081, () => {
  console.log("Listening on localhost:8081");
});
