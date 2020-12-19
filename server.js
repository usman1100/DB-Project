let express = require("express");
let mysql = require("mysql");
let creds = require("./config.js")
app = express();

app.set("view engine", "ejs")
app.use(express.urlencoded({extended:false}))

let db = mysql.createConnection(creds);

db.connect((err) => {
  if (err) {
    throw err;
  }

  console.log("Connected");
});

app.get("/", (req, res) => {
  res.render("index.ejs")
});

app.get("/submit", (req, res) => {
    res.render("submit.ejs")
  });


app.post("/submit/data/", (req, res) => {

    let title = req.body.title;
    let body_text = req.body.body_text;

    let q = `INSERT INTO posts(title, body)
             VALUES("` + title + `", "` + body_text +` ");`
    res.render("index.ejs")
    db.query(q);
    res.send(title + " " + body_text)
  });


app.listen(8081, () => {
  console.log("Listening on localhost:8081");
});
