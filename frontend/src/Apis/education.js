import API from "./api";

class Education {
  static async addEducation(school, degree, gpa, awards, userid) {
    let data = await API.m(
      `mutation($school: String!, $degree: String!, $gpa: String, $awards: String, $userid: Int!) { addEducation(school: $school, degree: $degree, gpa: $gpa, awards: $awards, userid: $userid) }`,
      {
        school: school,
        degree: degree,
        gpa: gpa,
        awards: awards,
        userid: userid,
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.addEducation;
  }

  static async getEducation(userid, page = 0) {
    let data = await API.q(
      `query($userid: Int!, $page: Int!) { getEducationList(userid: $userid, page: $page) {lastPage, values {id, school, degree, gpa, awards}} }`,
      {
        userid: userid,
        page: page,
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.getEducationList;
  }

  static async deleteEducation(id) {
    let data = await API.m(`mutation($id: Int!) { deleteEducation(id: $id) }`, {
      id: id,
    });
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.deleteEducation;
  }
}
export default Education;
