import API from "./api";

class Job {
  static async getUniqueJobFields(fields) {
    let data = await API.q(
      `query($fields: [String!]!) { getUniqueJobFields(fields: $fields) {key, values}}`,
      {
        fields: fields,
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.getUniqueJobFields;
  }
  static async getFilteredJobs(filters) {
    const { title, location, key_description, page } = filters;
    let data = await API.q(
      `query($title: IndJobFilter!, $location: IndJobFilter!, $key_description: IndJobFilter!, $page: Int!) { getFilteredJobs(title: $title, location: $location, key_description: $key_description, page: $page) {lastPage, values {title, id, author_id, description, key_description, company, qualification, location, deadline}}}`,
      {
        title: title,
        location: location,
        key_description: key_description,
        page: page,
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.getFilteredJobs;
  }
}
export default Job;
