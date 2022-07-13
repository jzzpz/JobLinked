const db = require("../db");
class Education {
  static async addEducation(school, degree, gpa, awards, userid) {
    return new Promise(async (resolve, reject) => {
      db.query(
        "INSERT into education(school, degree, gpa, awards, userid) Values ('" +
          school +
          "', '" +
          degree +
          "', " +
          (gpa === "NULL" ? "" : "'") +
          gpa +
          (gpa === "NULL" ? "" : "'") +
          ", " +
          (awards === "NULL" ? "" : "'") +
          awards.replace("'", "''") +
          (awards === "NULL" ? "" : "'") +
          ", " +
          userid +
          ");"
      ).then(
        (updated) => {
          if (updated) resolve(true);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }
  static async getEducationList(userid, page = 0) {
    return new Promise(async (resolve, reject) => {
      db.query(
        `select count(id) as numedu from education WHERE userid = ${userid}`
      )
        .then((numedu) => {
          let numedu_indb = numedu[0][0].numedu;
          if (page === 0 || numedu_indb > 5 + 5 * (page - 1)) {
            db.query(
              `SELECT id, school, degree, gpa, awards FROM education WHERE userid=${userid} LIMIT 5 OFFSET ${
                page * 5
              };`
            )
              .then(
                (result) => {
                  let eduList = result[0].map((curEdu) => {
                    return {
                      id: curEdu.id,
                      school: curEdu.school,
                      degree: curEdu.degree,
                      gpa: curEdu.gpa,
                      awards: curEdu.awards,
                    };
                  });
                  resolve({
                    values: eduList,
                    lastPage: numedu_indb <= 5 + 5 * page,
                  });
                },
                (err) => {
                  reject(err);
                }
              )
              .catch((err) => {
                reject(err);
              });
          } else {
            reject("Page is out of range");
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  static async deleteEducation(id) {
    return new Promise(async (resolve, reject) => {
      db.query("DELETE FROM education WHERE id = " + id + ";")
        .then((result) => {
          if (result) resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = Education;
