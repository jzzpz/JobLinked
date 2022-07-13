const db = require("../db");

class JobPosting {
  static async createJobPosting(authorId, title, location, qualification, keyDescription, description, deadline) {
    return new Promise(async (resolve, reject) => {
      db.query(
        `INSERT into job_postings(author_id, title, location, qualification, key_description, description, deadline) Values (${authorId}, '${title}', '${location}', '${qualification}', '${keyDescription}', '${description}', '${deadline}' );`
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

  static async getJobPosting(authorId, page) {
    return new Promise(async (resolve, reject) => {
      db.query(
        `SELECT id, title, location, qualification, key_description, description, deadline FROM job_postings WHERE author_id =${authorId} ORDER BY id LIMIT 10 OFFSET ${(page-1)*10};`
      ).then(
        (result) => {
          let jpList = result[0].map((curJP) => {
            return {
              id: curJP.id,
              title: curJP.title,
              location: curJP.location,
              qualification: curJP.qualification,
              keyDescription: curJP.key_description,
              description: curJP.description,
              deadline: curJP.deadline,
            };
          });
          resolve(jpList);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }
  static async deleteJobPosting(id) {
    return new Promise(async (resolve, reject) => {
      db.query("DELETE FROM job_postings WHERE id = " + id + ";").then((result) => {
        if (result) resolve(result);
      });
    });
  }
}
module.exports = JobPosting;
