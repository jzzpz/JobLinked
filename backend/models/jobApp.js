const db = require("../db");
class JobApp {
  static async applyJob(userId, jobId){
    return new Promise(async (resolve, reject) => {
        db.query(
          "SELECT * from jobApp Where userId = " +
            userId + 
            " AND jobId = " +
            jobId,
            []
          ).then(([results, fields]) => {
            if (results.length > 0) {
              reject("You've already applied for this job.");
            } else {
              db.query(
                "INSERT into jobApp(userId, jobId) Values ('" +
                  userId +
                  "', '" +
                  jobId +
                  "')",
                []
              ).then(
                function ([results, fields]) {
                  resolve(results);
                  return;
                },
                function (err) {
                  reject(err);
                }
              );
            }
          })
      });
  }
  static async didIApply(userId){
    return new Promise(async (resolve, reject) => {
        db.query(
          "SELECT jobId from jobApp Where userId = " +
            userId,
            []
          ).then(([results, fields]) => {
            resolve ([results.map(res => res.jobId)]);
          }).catch(err => reject(err));
      });
  }
  static async getApplicants(jobId){
    return new Promise(async (resolve, reject) => {
        db.query(
            `select users.id as id, name from jobApp inner join users on users.id = jobApp.userId where jobId = ${jobId}`,
            []
          ).then(([results, fields]) => {
            resolve (results);
          }).catch(err => reject(err));
      });
  }
  
}

module.exports = JobApp;
