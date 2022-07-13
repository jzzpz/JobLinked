import API from "./api";

class JobApp {
  static async applyJob(userId, jobId) {
    let data = await API.m(
      `mutation($userId: Int!, $jobId: Int!) {  applyJob(userId: $userId, jobId: $jobId) }`,
      {
        userId: userId,
        jobId: jobId
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.applyJob;
  }
  static async didIApply(userId, jobId) {
    let data = await API.q(
      `query($userId: Int!) {  didIApply(userId: $userId) }`,
      {
        userId: userId
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.didIApply;
  }
  static async getApplicants(jobId) {
    let data = await API.q(
      `query($jobId: Int!) {  getApplicants(jobId: $jobId) {id, name} }`,
      {
        jobId: jobId
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.getApplicants;
  }
}
export default JobApp;
