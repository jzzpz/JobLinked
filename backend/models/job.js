const db = require("../db");
class Job {
  static async getUniqueJobFields(fields) {
    const retrieveUniqueFields = (field) => {
      return new Promise(async (resolve, reject) => {
        db.query(`SELECT distinct(${field}) FROM job_postings;`)
          .then(([results, fields]) => {
            const uniqueFields = results.map((obj) => obj[field]);
            resolve({ key: field, values: uniqueFields });
          })
          .catch((err) => reject(err));
      });
    };
    let results = await Promise.all(fields.map(retrieveUniqueFields));
    return results;
  }
  static async getFilteredJobs(filter) {
    return new Promise(async (resolve, reject) => {
      let fieldCount = 0;
      let count = await db
        .query("Select count(*) from job_postings")
        .catch((err) => reject(err.message));
      count = count ? count[0].map((res) => res["count(*)"])[0] : false;
      Object.keys(filter).forEach((key) => {
        if (key !== "page") fieldCount += filter[key].values.length;
      });
      let templateQuery =
        "SELECT job_postings.id, author_id, users.name as company, title, job_postings.location as location, qualification, key_description, description, deadline FROM job_postings INNER JOIN users ON job_postings.author_id = users.id ";
      templateQuery += fieldCount > 0 ? "WHERE" : "";
      Object.keys(filter)
        .filter((key) => key !== "page" && filter[key].values.length > 0)
        .forEach(function (key, keyIndex, keysArr) {
          const { values, setAll } = filter[key];
          values.forEach(function (val, valIndex, valuesArr) {
            let arrayKey = key === "location" ? "job_postings.location" : key;
            if (
              valIndex === valuesArr.length - 1 &&
              keyIndex !== keysArr.length - 1
            ) {
              templateQuery += ` ${arrayKey} like \'%${val}%\' AND`;
            } else if (
              valIndex === valuesArr.length - 1 &&
              keyIndex === keysArr.length - 1
            ) {
              templateQuery += ` ${arrayKey} like \'%${val}%\'`;
            } else {
              if (setAll) {
                templateQuery += ` ${arrayKey} like \'%${val}%\' AND`;
              }
              templateQuery += ` ${arrayKey} like \'%${val}%\' OR`;
            }
          });
        });
      const page = filter.page;
      templateQuery += ` LIMIT ${10 * page}, 10 `;
      templateQuery += ";";
      db.query(templateQuery)
        .then(([results, fields]) => {
          const lastPage = results.length < 10 || (page + 1) * 10 === count;
          resolve({ values: results, lastPage });
        })
        .catch((err) => reject(err.message));
    });
  }
  static async getJobById(jobId) {
    return new Promise(async (resolve, reject) => {
      db.query(
        `SELECT job_postings.id, users.name as company, title, job_postings.location as location, qualification, key_description, description, deadline FROM job_postings INNER JOIN users ON job_postings.author_id = users.id where job_postings.id = ${jobId}`
      )
        .then(([results, fields]) => {
          resolve(results);
        })
        .catch((err) => reject(err));
    });
  }
}

module.exports = Job;
