const db = require("../db");
const bcrypt = require("bcrypt");
const saltRounds = 10;
class User {
  static async updateAbout(id, name, location, about) {
    return new Promise(async (resolve, reject) => {
      db.query(
        `UPDATE users SET about = '${about}', name = '${name}', location = '${location}' WHERE id = ${id};`
      )
        .then((updated) => {
          if (updated) resolve(true);
          else reject("User Does not Exist");
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  static async getUserType(id) {
    return new Promise(async (resolve, reject) => {
      db.query(`SELECT user_type FROM users WHERE id = ${id};`)
        .then((userType) => {
          if (userType[0][0].user_type) resolve(userType[0][0].user_type);
          else reject("User DNE");
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  static async getProfile(id) {
    return new Promise(async (resolve, reject) => {
      db.query(
        `SELECT id, name, about, location, user_type FROM users WHERE id = ${id} LIMIT 1;`
      )
        .then((profile) => {
          if (profile) resolve(profile[0][0]);
          else reject("User DNE");
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  static async checkProfileExists(email) {
    return new Promise(async (resolve, reject) => {
      db.query(
        `SELECT id, name, about, location, user_type FROM users WHERE email='${email}' LIMIT 1;`
      )
        .then((result) => {
          if (result) resolve(result[0].length > 0);
          else reject("User Does not Exist");
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  static async login(email, password) {
    return new Promise(async (resolve, reject) => {
      db.query(
        `SELECT id, password FROM users WHERE email='${email}' LIMIT 1;`
      ).then(
        function (results, fields) {
          if (results[0].length > 0) {
            const userPw = results[0][0].password;
            bcrypt.compare(password, userPw).then((result) => {
              if (result) {
                resolve(results[0][0].id);
              } else {
                reject("Unable to login");
              }
            });

            return;
          }
          reject("User not found");
        },
        (err) => reject(err)
      );
    });
  }
  static async create(name, password, email, user_type) {
    return new Promise(async (resolve, reject) => {
      db.query("SELECT id, password FROM users WHERE email='" + email + "';")
        .then(([result, fields]) => {
          if (result.length === 0) {
            bcrypt.hash(password, saltRounds, function (err, hash) {
              db.query(
                `INSERT into users(name, email, password, user_type) Values ('${name}', '${email}', '${hash}', '${user_type}')`
              ).then(
                function ([results, fields]) {
                  resolve(results);
                },
                function (err) {
                  reject(err);
                }
              );
            });
          } else {
            reject("User already exists");
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = User;
