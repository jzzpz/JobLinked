import API from "./api";

// TODO: VALIDATION checking
class Review {
  static async addReview(reviewer, company, rating, desc) {
    let data = await API.m(
      `mutation($reviewer: Int!, $company: Int!, $rating: Int!, $desc: String!) {addReview (reviewer: $reviewer, company: $company, rating: $rating, desc: $desc) }`,
      {
        reviewer: reviewer,
        company: company,
        rating: rating,
        desc: desc,
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.addReview;
  }

  static async getReviews(companyId, page = 0) {
    // query job postings for a specific user
    // `query($companyId: Int!) { getReview(companyId: $companyId) {id, title, location, qualification, keyDescription, description, deadline}}`
    let data = await API.q(
      `query($companyId: Int!, $page: Int!) { getReviews(companyId: $companyId, page: $page) {lastPage, values {id, reviewer, rating, description}}}`,
      {
        companyId: companyId,
        page: page,
      }
    );

    // // query all job postings if authorId = 0
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.getReviews;
  }

  static async deleteReview(id) {
    let data = await API.m(`mutation($id: Int!) { deleteReview(id: $id) }`, {
      id: id,
    });
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.deleteReview;
  }
}

export default Review;
