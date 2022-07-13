const db = require("../db");
class Interview {
  static async addInterview(employee, employer, jobPostingId, datetime) {
    const time = datetime.toString();
    return new Promise(async (resolve, reject) => {
      // First check if interview exists
      db.query(
        `SELECT * from interview where employee = ${employee} AND employer = ${employer} and jobPostingId = ${jobPostingId}`
      )
        .then((result) => {
          if (result[0].length > 0) {
            return Promise.resolve(true);
          }
          return Promise.resolve(false);
        })
        .then((alreadyExists) => {
          if (!alreadyExists) {
            db.query(
              "INSERT into interview(employee, employer, jobPostingId, date_time) Values (" +
                employee +
                ", " +
                employer +
                ", " +
                jobPostingId +
                ", '" +
                time +
                "');"
            ).then(
              (updated) => {
                if (updated) resolve(true);
              },
              (err) => {
                reject(err);
              }
            );
          } else {
            db.query(
              `UPDATE interview set date_time = \"${time}\" where employer = ${employer} AND employee = ${employee} and jobPostingId = ${jobPostingId}`
            ).then(
              (updated) => {
                if (updated) resolve(true);
              },
              (err) => {
                reject(err);
              }
            );
          }
        });
    });
  }
  static async getInterview(id) {
    return new Promise(async (resolve, reject) => {
      db.query(
        "SELECT interview.id as id, interview.employee as employee, interview.employer as employer, interview.date_time as date_time," +
          " users.name as company, job_postings.title as position FROM ((interview INNER JOIN job_postings ON " +
          "interview.jobPostingId = job_postings.id) INNER JOIN users ON users.id = job_postings.author_id) WHERE interview.id = " +
          id +
          " LIMIT 1;"
      ).then(
        (result) => {
          resolve(result[0][0]);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  static async getUserInterviews(userid, page = 0, limit = true) {
    return new Promise(async (resolve, reject) => {
      let count = await db
        .query(`Select count(*) from interview where employee = ${userid}`)
        .catch((err) => reject(err.message));
      count = count ? count[0].map((res) => res["count(*)"])[0] : false;
      let lim = limit ? ` LIMIT ${10 * page}, 10 ` : ";";
      db.query(
        "SELECT interview.id as id, interview.employee as employee, interview.employer as employer, interview.date_time as date_time, " +
          "users.name as company, job_postings.title as position FROM ((interview INNER JOIN job_postings ON " +
          "interview.jobPostingId = job_postings.id) INNER JOIN users ON users.id = job_postings.author_id) WHERE interview.employee = " +
          userid +
          lim
      ).then(
        (result) => {
          let interviewList = result[0].map((curInterview) => {
            return {
              id: curInterview.id,
              employee: curInterview.employee,
              employer: curInterview.employer,
              date_time: curInterview.date_time,
              company: curInterview.company,
              position: curInterview.position,
            };
          });
          const isLastPage = interviewList.length < 10 || (page + 1) * 10 === count;
          resolve({ interviews: interviewList, isLastPage });
        },
        (err) => {
          reject(err);
        }
      );
    });
  }
  static async deleteInterview(id) {
    return new Promise(async (resolve, reject) => {
      db.query("DELETE FROM interview WHERE id = " + id + ";")
        .then((result) => {
          if (result) resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  static async getInterviewByEmployerAndEmployee(employer, employee, jobPostingId) {
    return new Promise(async (resolve, reject) => {
      db.query(
        "SELECT employee, employer, date_time, title, interview.id AS id FROM (interview INNER JOIN job_postings ON " +
          "interview.jobPostingId = job_postings.id" +
          ") WHERE employer=" +
          employer +
          " AND " +
          "employee=" +
          employee +
          " AND job_postings.id = " +
          jobPostingId +
          ";"
      )
        .then((result) => {
          if (result[0] && result[0][0]) resolve(result[0][0]);
          else resolve(null);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = Interview;
