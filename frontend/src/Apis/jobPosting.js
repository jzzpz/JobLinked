import API from "./api";

// TODO: VALIDATION checking
class JobPosting {
  static async createJobPosting(authorId, title, location, qualification, keyDescription, description, deadline) {
    let data = await API.m(
      `mutation($authorId: Int!, $title: String!, $location: String!, $qualification: String!, $keyDescription: String!, $description: String!, $deadline: String!) {createJobPosting (authorId: $authorId, title: $title, location: $location, qualification: $qualification, keyDescription: $keyDescription, description: $description, deadline: $deadline) }`,
      {
        authorId: authorId,
        title: title,
        location: location,
        qualification: qualification,
        keyDescription: keyDescription,
        description: description,
        deadline: deadline,
      }
    );
    return data.data.createJobPosting;
  }

  static async getJobPosting(authorId, page) {
    // query job postings for a specific user
    // `query($authorId: Int!) { getJobPosting(authorId: $authorId) {id, title, location, qualification, keyDescription, description, deadline}}`
    let data = await API.q(
      `query($authorId: Int!, $page: Int!) { getJobPosting(authorId: $authorId, page: $page) {id, title, location, qualification, keyDescription, description, deadline}}`,
      {
        authorId: authorId,
        page: page,
      }
    );

    // // query all job postings if authorId = 0
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.getJobPosting;
  }

  static async deleteJobPosting(id) {
    let data = await API.m(`mutation($id: Int!) { deleteJobPosting(id: $id) }`, {
      id: id,
    });
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.deleteJobPosting;
  }
}

export default JobPosting;
