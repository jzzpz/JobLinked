// TODO: remmove this and add a connection/poll in db.js
const User = require("./models/user");
const Job = require("./models/job");
const JobApp = require("./models/jobApp");
const cookie = require("cookie");
const JobPosting = require("./models/jobPosting");
const Education = require("./models/education");
const JobExperience = require("./models/jobExp");
const Interview = require("./models/interview");
const Review = require("./models/review");
const validator = require("validator");
require("dotenv").config();
const dev_mode = process.env.dev_mode === "true";

const rootValue = {
  updateAbout: async ({ id, name, location, about }, context) => {
    let valid =
      validator.isAlpha(name.replace(/ /g, "")) &&
      validator.escape(name) &&
      validator.escape(location) &&
      validator.escape(about);
    if (!valid) {
      context.res.status(400);
      return Error("Inputs are not formatted correctly");
    }
    if (!context.req.signedIn) {
      context.res.status(403);
      return Error("Access Denied");
    }
    let updated = await User.updateAbout(id, name, location, about);
    if (updated) return true;
    return false;
  },
  getProfile: async ({ id }, context) => {
    if (!context.req.signedIn) {
      context.res.status(403);
      return Error("Access Denied");
    }
    let profile = await User.getProfile(id);
    if (profile) return profile;
    return null;
  },
  getFilteredJobs: async (params, context) => {
    let valid = true;
    Object.keys(params).forEach((key) => {
      if (key !== "page") {
        const filter = params[key];
        if (
          filter.values.some((val) => !validator.escape(val.replace(/ /g, "")))
        )
          valid = false;
      }
    });
    if (!valid) {
      context.res.status(400);
      return Error("Inputs are not formatted correctly");
    }
    let jobs = await Job.getFilteredJobs(params);
    return jobs || { values: [], lastPage: true };
  },
  signUpUser: async ({ name, password, email, userType }, context) => {
    let valid =
      validator.isAlpha(name.replace(/ /g, "")) &&
      validator.escape(name) &&
      validator.escape(password) &&
      validator.isEmail(email) &&
      (userType === "JOB_SEEKER" || userType === "EMPLOYER");
    if (!valid) {
      context.res.status(400);
      return Error("Inputs are not formatted correctly");
    }
    let result = await User.create(name, password, email, userType);
    if (result) {
      return true;
    }
    return false;
  },
  signInUser: async ({ email, password }, context) => {
    let valid = validator.escape(password) && validator.isEmail(email);
    if (!valid) {
      context.res.status(400);
      return Error("Inputs are not formatted correctly");
    }
    let result = await User.login(email, password);
    if (result) {
      context.req.session.userid = result;
      let userType = await User.getUserType(result);
      if (userType) {
        context.res.setHeader(
          "Set-Cookie",
          cookie.serialize("userid", result, {
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
            httpOnly: false,
            ...(!dev_mode && { secure: true }),
            samesite: "strict",
          })
        );
      }

      return result;
    }
    return null;
  },
  logoutUser: async ({}, context) => {
    if (!context.req.signedIn) {
      context.res.status(403);
      return Error("Access Denied");
    }
    context.req.session.destroy();
    context.res.cookie("userid", "", {
      maxAge: 0,
      httpOnly: false,
      ...(!dev_mode && { secure: true }),
      samesite: "strict",
    });

    return true;
  },
  applyJob: async ({ userId, jobId }, context) => {
    let result = await JobApp.applyJob(userId, jobId);
    if (result) {
      return true;
    } else {
      return false;
    }
  },
  getUniqueJobFields: async ({ fields }, context) => {
    let valid = true;
    fields.forEach((field) => {
      valid =
        valid && validator.isAlphanumeric(field) && validator.escape(field);
    });
    if (!valid) {
      context.res.status(400);
      return Error("Inputs are not formatted correctly");
    }
    let results = await Job.getUniqueJobFields(fields);
    if (results) {
      return results;
    } else {
      return [];
    }
  },
  didIApply: async ({ userId }, context) => {
    let result = await JobApp.didIApply(userId);
    return result[0];
  },
  createJobPosting: async (
    {
      authorId,
      title,
      location,
      qualification,
      keyDescription,
      description,
      deadline,
    },
    context
  ) => {
    let valid = true;
    [title, location, qualification, keyDescription, description].forEach(
      (val) => (valid = valid && validator.escape(val))
    );
    valid = valid && validator.escape(deadline);
    [
      title,
      location,
      qualification,
      keyDescription,
      description,
      deadline,
    ].forEach((val) => (valid = valid && validator.escape(val)));
    if (!valid) {
      context.res.status(400);
      return Error("Inputs are not formatted correctly");
    }

    let isAdded = await JobPosting.createJobPosting(
      authorId,
      title,
      location,
      qualification,
      keyDescription,
      description,
      deadline
    );
    if (isAdded) return true;
    return false;
  },
  getJobPosting: async ({ authorId, page }, context) => {
    let jobPostings = await JobPosting.getJobPosting(authorId, page);
    if (jobPostings) return jobPostings;
    return null;
  },
  deleteJobPosting: async ({ id }, context) => {
    if (!context.req.signedIn) {
      context.res.status(403);
      return Error("Access Denied");
    }
    let deleted = await JobPosting.deleteJobPosting(id);
    if (deleted) return true;
    return false;
  },

  addEducation: async ({ school, degree, gpa, awards, userid }, context) => {
    let valid =
      validator.isAlpha(school.replace(/ /g, "")) &&
      validator.escape(school) &&
      validator.isAlpha(degree.replace(/ /g, "")) &&
      validator.escape(degree) &&
      validator.escape(awards);
    if (!valid) {
      context.res.status(400);
      return Error("Inputs are not formatted correctly");
    }
    if (!context.req.signedIn) {
      context.res.status(403);
      return Error("Access Denied");
    }
    let added = await Education.addEducation(
      school,
      degree,
      gpa,
      awards,
      userid
    );
    if (added) return true;
    return false;
  },
  getEducationList: async ({ userid, page }, context) => {
    let valid = page >= 0;
    if (!valid) {
      context.res.status(400);
      return Error("Inputs are not formatted correctly");
    }
    if (!context.req.signedIn) {
      context.res.status(403);
      return Error("Access Denied");
    }
    let educationList = await Education.getEducationList(userid, page);
    if (educationList) return educationList;
    return { values: [], lastPage: true };
  },
  deleteEducation: async ({ id }, context) => {
    if (!context.req.signedIn) {
      context.res.status(403);
      return Error("Access Denied");
    }
    let deleted = await Education.deleteEducation(id);
    if (deleted) return true;
    return false;
  },
  addJobExperience: async (
    { title, country, description, company, userid },
    context
  ) => {
    let valid =
      validator.isAlpha(title.replace(/ /g, "")) &&
      validator.escape(title) &&
      validator.escape(country) &&
      validator.isAlpha(company.replace(/ /g, "")) &&
      validator.escape(company);
    if (!valid) {
      context.res.status(400);
      return Error("Inputs are not formatted correctly");
    }
    if (!context.req.signedIn) {
      context.res.status(403);
      return Error("Access Denied");
    }
    let added = await JobExperience.addJobExperience(
      title,
      country,
      description,
      company,
      userid
    );
    if (added) return true;
    return false;
  },
  getJobExperienceList: async ({ userid, page }, context) => {
    let valid = page >= 0;
    if (!valid) {
      context.res.status(400);
      return Error("Inputs are not formatted correctly");
    }
    if (!context.req.signedIn) {
      context.res.status(403);
      return Error("Access Denied");
    }
    let JobExperienceList = await JobExperience.getJobExperienceList(
      userid,
      page
    );
    if (JobExperienceList) return JobExperienceList;
    return { values: [], lastPage: true };
  },
  deleteJobExperience: async ({ id }, context) => {
    if (!context.req.signedIn) {
      context.res.status(403);
      return Error("Access Denied");
    }
    let deleted = await JobExperience.deleteJobExperience(id);
    if (deleted) return true;
    return false;
  },
  addInterview: async (
    { employee, employer, jobPostingId, datetime },
    context
  ) => {
    if (!context.req.signedIn) {
      context.res.status(403);
      return Error("Access Denied");
    }
    let added = await Interview.addInterview(
      employee,
      employer,
      jobPostingId,
      datetime
    );
    if (added) return true;
    return false;
  },
  getInterview: async ({ id }, context) => {
    if (!context.req.signedIn) {
      context.res.status(403);
      return Error("Access Denied");
    }
    let single_interview = await Interview.getInterview(id);
    if (single_interview) return single_interview;
    return null;
  },
  getUserInterviews: async ({ userid, page }, context) => {
    if (!context.req.signedIn) {
      context.res.status(403);
      return Error("Access Denied");
    }
    let single_interview = await Interview.getUserInterviews(userid, page);
    if (single_interview) return single_interview;
    return [];
  },
  deleteInterview: async ({ id }, context) => {
    if (!context.req.signedIn) {
      context.res.status(403);
      return Error("Access Denied");
    }
    let deleted = await Interview.deleteInterview(id);
    if (deleted) return true;
    return false;
  },
  getApplicants: async ({ jobId }, context) => {
    let results = await JobApp.getApplicants(jobId);
    return results;
  },
  getInterviewByEmployerAndEmployee: async (
    { employer, employee, jobPostingId },
    context
  ) => {
    let result = await Interview.getInterviewByEmployerAndEmployee(
      employer,
      employee,
      jobPostingId
    );
    return result;
  },
  addReview: async ({ reviewer, company, rating, desc }, context) => {
    let valid = rating > 0 && rating <= 5;
    if (!valid) {
      context.res.status(400);
      return Error("Inputs are not formatted correctly");
    }
    if (!context.req.signedIn) {
      context.res.status(403);
      return Error("Access Denied");
    }
    let added = await Review.addReview(reviewer, company, rating, desc);
    if (added) return true;
    return false;
  },
  getReviews: async ({ companyId, page = 0 }, context) => {
    if (!context.req.signedIn) {
      context.res.status(403);
      return Error("Access Denied");
    }
    let reviews = await Review.getReviews(companyId, page);
    if (reviews) return reviews;
    return null;
  },
  deleteReview: async ({ userid, id }, context) => {
    if (!context.req.signedIn) {
      context.res.status(403);
      return Error("Access Denied");
    }
    let deleted = await Review.deleteReview(userid, id);
    if (deleted) return true;
    return false;
  },
  checkProfileExists: async ({ email }, context) => {
    let result = await User.checkProfileExists(email);
    return result;
  },
};

module.exports = rootValue;
