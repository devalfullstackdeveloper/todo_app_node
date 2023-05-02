var mysql = require("mysql");
require("dotenv").config();
const dbPassword = process.env.dbPassword;
const dbUserName = process.env.dbUserName;
var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  // database: "leavemanagement",
  database: "todo",
  timezone: 'utc'
});
db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
module.exports = db;