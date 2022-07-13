const db = require("../db");
class JobExperience {
  static async addJobExperience(title, country, description, company, userid) {
    return new Promise(async (resolve, reject) => {
      db.query(
        "INSERT into jobExperience(title, country, description, company, userid) Values ('" +
          title +
          "', '" +
          country +
          "', '" +
          description +
          "', '" +
          company +
          "', " +
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
  static async getJobExperienceList(userid, page = 0) {
    return new Promise(async (resolve, reject) => {
      db.query(
        `select count(id) as numJobExp from jobExperience WHERE userid = ${userid}`
      )
        .then((numJobExp) => {
          let numJobExp_indb = numJobExp[0][0].numJobExp;
          let offset = page * 4;
          if (page === 0 || numJobExp_indb > 4 + 4 * (page - 1)) {
            let lim = " LIMIT " + offset + ", 4;";
            db.query(
              "SELECT id, title, country, description, company FROM jobExperience WHERE userid=" +
                userid +
                lim
            ).then(
              (result) => {
                let jobExpList = result[0].map((curJobExp) => {
                  return {
                    id: curJobExp.id,
                    title: curJobExp.title,
                    country: curJobExp.country,
                    description: curJobExp.description,
                    company: curJobExp.company,
                  };
                });
                resolve({
                  values: jobExpList,
                  lastPage: numJobExp_indb <= 4 + 4 * page,
                });
              },
              (err) => {
                reject(err);
              }
            );
          } else {
            reject("Page is out of range");
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  static async deleteJobExperience(id) {
    return new Promise(async (resolve, reject) => {
      db.query("DELETE FROM jobExperience WHERE id = " + id + ";")
        .then((result) => {
          if (result) resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = JobExperience;
