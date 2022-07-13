const mysql = require("mysql");
require("dotenv").config();
const dev_mode = process.env.dev_mode === "true";

var pool = mysql.createPool({
  connectionLimit: 10,
  host: dev_mode ? "127.0.0.1" : "us-cdbr-east-05.cleardb.net",
  user: dev_mode ? "root" : "bea62d974362df",
  password: dev_mode ? "password123" : "96f2c868",
  database: dev_mode ? "job_linked" : "heroku_2602b2affeca3f6",
});

async function query(sql, params) {
  return new Promise(async (resolve, reject) => {
    pool.query(sql, function (err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve([rows, fields]);
      }
    });
  });
}

module.exports = {
  query,
};
