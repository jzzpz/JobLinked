import API from "./api";

class Interview {
  static async addInterview(employee, employer, jobPostingId, datetime) {
    let data = await API.m(
      `mutation($employee: Int!, $employer: Int!, $jobPostingId: Int!, $datetime: String!) { addInterview(employee: $employee, employer: $employer, jobPostingId: $jobPostingId, datetime: $datetime) }`,
      {
        employee: employee,
        employer: employer,
        jobPostingId: jobPostingId,
        datetime: datetime,
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.addInterview;
  }

  static async getInterview(id) {
    let data = await API.q(
      `query($id: Int!) { getInterview(id: $id) {employee,
        employer,
        date_time,
        id, position} }`,
      {
        id: id,
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.getInterview;
  }

  static async getUserInterviews(userid, page = 0) {
    let data = await API.q(
      `query($userid: Int!, $page: Int!) { getUserInterviews(userid: $userid, page: $page) {interviews {employee,
        employee, 
        employer, 
        date_time, 
        company, 
        position, 
        id}, isLastPage} }`,
      {
        userid: userid,
        page: page,
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.getUserInterviews;
  }

  static async deleteInterview(id) {
    let data = await API.m(`mutation($id: Int!) { deleteInterview(id: $id) }`, {
      id: id,
    });
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.deleteInterview;
  }

  static async getInterviewByEmployerAndEmployee(
    employer,
    employee,
    jobPostingId
  ) {
    let data = await API.q(
      `query($employer: Int!, $employee: Int!,  $jobPostingId: Int!) { getInterviewByEmployerAndEmployee(employer: $employer, employee: $employee, jobPostingId: $jobPostingId) {
        employee,
        employer,
        date_time,
        title,
        id
      } }`,
      {
        employer: employer,
        employee: employee,
        jobPostingId: jobPostingId,
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.getInterviewByEmployerAndEmployee;
  }
}
export default Interview;
