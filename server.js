let express = require("express");
let mysql = require("mysql");
let creds = require("./config.js")
app = express();

let db = mysql.createConnection(creds);


db.connect((err) => {
  if (err) {
    throw err;
  }

  console.log("Connected");
});

qry = `INSERT INTO posts(title, body)
       VALUES ("Title of first post", "This is the best I can do")`

db.query(qry)

app.get("/", (req, res) => {
  res.send("hello");
});

app.listen(8081, () => {
  console.log("Listening on localhost:8081");
});
