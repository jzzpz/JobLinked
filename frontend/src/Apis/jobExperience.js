import API from "./api";

class JobExperience {
  static async addJobExperience(title, country, description, company, userid) {
    let data = await API.m(
      `mutation($title: String!, $country: String!, $description: String!, $company: String!, $userid: Int!) { addJobExperience(title: $title, country: $country, description: $description, company: $company, userid: $userid) }`,
      {
        title: title,
        country: country,
        description: description,
        company: company,
        userid: userid,
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.addJobExperience;
  }

  static async getJobExperience(userid, page = 0) {
    let data = await API.q(
      `query($userid: Int!, $page: Int!) { getJobExperienceList(userid: $userid, page: $page) {lastPage, values {id, title, country, description, company}}}`,
      {
        userid: userid,
        page: page,
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.getJobExperienceList;
  }

  static async deleteJobExperience(id) {
    let data = await API.m(
      `mutation($id: Int!) { deleteJobExperience(id: $id) }`,
      {
        id: id,
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.deleteJobExperience;
  }
}
export default JobExperience;
