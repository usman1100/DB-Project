let express = require("express");
let mysql = require("mysql");
let creds = require("./config.js")
app = express();

app.set("view engine", "ejs")

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

app.listen(8081, () => {
  console.log("Listening on localhost:8081");
});
