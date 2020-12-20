let express = require("express");
let mysql = require("mysql");
let creds = require("./config.js");
let session = require("express-session");

app = express();


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


app.get("/register", (req, res) => {
  res.render("register.ejs")
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
