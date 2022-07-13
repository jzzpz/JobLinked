const db = require("../db");
class Review {
  static async addReview(reviewer, company, rating, desc) {
    return new Promise(async (resolve, reject) => {
      // First check if Review exists
      db.query(
        `SELECT COUNT(id) as numreviews from review where reviewer = ${reviewer} AND company = ${company};`
      )
        .then((result) => {
          if (result[0][0].numreviews > 0) {
            return Promise.resolve(true);
          }
          return Promise.resolve(false);
        })
        .then((alreadyExists) => {
          if (!alreadyExists) {
            db.query(
              `INSERT into review(reviewer, company, rating, description) Values (${reviewer}, ${company}, ${rating}, '${desc}');`
            ).then(
              (updated) => {
                if (updated) resolve(true);
              },
              (err) => {
                reject(err);
              }
            );
          } else {
            reject("Cannot leave more than one review.");
          }
        });
    });
  }
  static async getReviews(companyid, page = 0) {
    return new Promise(async (resolve, reject) => {
      db.query(
        `select count(id) as numreviews from review WHERE company = ${companyid}`
      ).then((numreviews) => {
        let numreviews_indb = numreviews[0][0].numreviews;
        db.query(
          "SELECT review.id as id, users.name as reviewer, review.rating as rating, review.description as description" +
            " FROM review INNER JOIN users ON users.id = review.reviewer WHERE review.company = " +
            companyid +
            ` LIMIT 5 OFFSET ${page * 5};`
        ).then(
          (result) => {
            resolve({
              values: result[0],
              lastPage: numreviews_indb <= 5 + 5 * page,
            });
          },
          (err) => {
            reject(err);
          }
        );
      });
    });
  }

  static async deleteReview(userid, id) {
    return new Promise(async (resolve, reject) => {
      db.query(`DELETE FROM review WHERE id = ${id} AND reviewer = ${userid};`)
        .then((result) => {
          if (result) resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = Review;
