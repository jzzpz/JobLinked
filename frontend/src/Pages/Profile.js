import React, { useEffect } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/profile.css";
import "../Styles/pages.css";
import "../Styles/icons.css";
import "../Styles/card.css";
import JobCard from "../Components/JobCard";
import Rating from "@mui/material/Rating";
import EditIcon from "@mui/icons-material/Edit";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import { JOB_SEEKER, EMPLOYER } from "../Constants/user";
import {
  SUMMARY,
  EDUCATION,
  EXPERIENCE,
  JOBS,
  SAMPLE_AWARDS,
} from "../Constants/profile";
import Typography from "@mui/material/Typography";
import HailIcon from "@mui/icons-material/Hail";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import CountrySelect from "../Components/CountrySelect";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Autocomplete from "@mui/material/Autocomplete";
import User from "../Apis/user";
import JobApp from "../Apis/jobApp";
import Education from "../Apis/education";
import Review from "../Apis/review";
import JobPosting from "../Apis/jobPosting";
import JobExperience from "../Apis/jobExperience";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";

function Profile() {
  const [value, setValue] = React.useState(1);
  const [profile, setProfile] = React.useState(undefined);
  const [user, setUser] = React.useState(undefined);
  const [profileExperiences, setprofileExperiences] = React.useState({
    values: [],
    lastPage: true,
  });
  const [education, setEducation] = React.useState({
    values: [],
    lastPage: true,
  });
  const [ratings, setRatings] = React.useState({
    values: [],
    lastPage: true,
  });
  const [jobs, setJobs] = React.useState([]);
  const [updateSummaryDialog, setUpdateSummaryDialog] = React.useState(false);
  const [professionalExpDialog, setProfessionalExpDialog] =
    React.useState(false);
  const [eduDialogOpen, setEduDialogOpen] = React.useState(false);
  const [awards, setAwards] = React.useState([]);
  const [snackbarOpen, setsnackbarOpen] = React.useState(false);
  const [alert, setAlert] = React.useState({ type: "error", msg: "" });
  const [curExpPage, setcurExpPage] = React.useState(0);
  const [curReviewsPage, setcurReviewsPage] = React.useState(0);
  const [curEducationPage, setcurEducationPage] = React.useState(0);
  const [curJobPostingPage, setcurJobPostingPage] = React.useState(1);

  let { id } = useParams();

  const userId = User.getId();
  let navigate = useNavigate();
  if (isNaN(id)) navigate(`/not-found`);

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  }));

  const updateExpPage = (page) => {
    if (page >= 0) {
      updateJobsExperience(page);
    } else {
      setAlert({ type: "error", msg: "Invalid Page" });
      setsnackbarOpen(true);
    }
  };

  const updateReviewsPage = (page) => {
    if (page >= 0) {
      updateReviews(page);
    } else {
      setAlert({ type: "error", msg: "Invalid Page" });
      setsnackbarOpen(true);
    }
  };

  const updateEduPage = (page) => {
    if (page >= 0) {
      updateEducation(page);
    } else {
      setAlert({ type: "error", msg: "Invalid Page" });
      setsnackbarOpen(true);
    }
  };

  const updateJPPage = (page) => {
    if (page >= 1) {
      updateJobsList(page);
    } else {
      setAlert({ type: "error", msg: "Invalid Page" });
      setsnackbarOpen(true);
    }
  };

  function handleCloseDialog() {
    setUpdateSummaryDialog(false);
    setProfessionalExpDialog(false);
    setEduDialogOpen(false);
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setsnackbarOpen(false);
  };

  function handleUpdateSummary() {
    let form = document.querySelector("#updateSummaryDialog");
    let name = form.querySelector("#name").value;
    let location = form.querySelector("#location").value;
    let about = form.querySelector("#about").value;
    User.updateAbout(parseInt(userId), name, location, about).then(
      (updated) => {
        if (updated) {
          User.profile(parseInt(id)).then((pfile) => {
            setProfile(pfile);
          });
          setAlert({ type: "success", msg: "Update Successful." });
          setsnackbarOpen(true);
        } else {
          setAlert({
            type: "error",
            msg: "Something went wrong. Update Unsuccessful.",
          });
          setsnackbarOpen(true);
        }
      },
      (err) => {
        setAlert({ type: "error", msg: err.message });
        setsnackbarOpen(true);
      }
    );
    setUpdateSummaryDialog(false);
  }

  const handleAddEdu = () => {
    let form = document.querySelector("#addEduDialog");
    let school = form.querySelector("#school").value;
    let degree = form.querySelector("#degree").value;
    let gpa = form.querySelector("#gpa").value;
    Education.addEducation(
      school,
      degree,
      gpa.length > 0 ? gpa : "NULL",
      awards.length > 0 ? awards.join(" | ") : "NULL",
      parseInt(userId)
    ).then(
      (added) => {
        if (added) {
          updateEducation();
          setAlert({ type: "success", msg: "Update Successful." });
          setsnackbarOpen(true);
        }
      },
      (err) => {
        setAlert({ type: "error", msg: err.message });
        setsnackbarOpen(true);
      }
    );
    setEduDialogOpen(false);
  };

  const handleAddJob = () => {
    let form = document.querySelector("#addJobDialog");
    let country = form.querySelector("#country-select").value;
    let pos = form.querySelector("#pos").value;
    let company = form.querySelector("#company").value;
    let desc = form.querySelector("#desc").value;
    JobExperience.addJobExperience(
      pos,
      country,
      desc,
      company,
      parseInt(userId)
    ).then(
      (added) => {
        if (added) {
          updateJobsExperience();
          setAlert({ type: "success", msg: "Update Successful." });
          setsnackbarOpen(true);
        }
      },
      (err) => {
        setAlert({ type: "error", msg: err.message });
        setsnackbarOpen(true);
      }
    );
    setProfessionalExpDialog(false);
  };

  function removeJob(id) {
    JobExperience.deleteJobExperience(id).then(
      (deleted) => {
        updateExpPage(0);
        setAlert({ type: "success", msg: "Update Successful." });
        setsnackbarOpen(true);
      },
      (err) => {
        setAlert({ type: "error", msg: err.message });
        setsnackbarOpen(true);
      }
    );
  }

  function removeEdu(id) {
    Education.deleteEducation(id).then(
      (deleted) => {
        if (deleted) {
          let removedEdu = education.values.filter((element) => {
            return element.id !== id;
          });
          setEducation({ values: removedEdu, lastPage: education.lastPage });
          updateEduPage(0);
          setAlert({ type: "success", msg: "Update Successful." });
          setsnackbarOpen(true);
        }
      },
      (err) => {
        setAlert({ type: "error", msg: err.message });
        setsnackbarOpen(true);
      }
    );
  }

  function updateJobsExperience(page = 0) {
    JobExperience.getJobExperience(parseInt(id), page)
      .then((jobExpList) => {
        if (jobExpList.values.length > 0) {
          setprofileExperiences(jobExpList);
          if (page !== curExpPage) setcurExpPage(page);
        }
      })
      .catch((err) => {
        setAlert({ type: "error", msg: err.message });
        setsnackbarOpen(true);
      });
  }

  function updateReviews(page = 0) {
    Review.getReviews(parseInt(id), page)
      .then((reviewsList) => {
        if (reviewsList.values.length > 0) {
          setRatings(reviewsList);
          if (page !== curReviewsPage) setcurReviewsPage(page);
        }
      })
      .catch((err) => {
        setAlert({ type: "error", msg: err.message });
        setsnackbarOpen(true);
      });
  }

  function updateEducation(page = 0) {
    Education.getEducation(parseInt(id), page)
      .then((eduList) => {
        if (eduList.values.length > 0) {
          setEducation(eduList);
          if (page !== curEducationPage) setcurEducationPage(page);
        }
      })
      .catch((err) => {
        setAlert({ type: "error", msg: err.message });
        setsnackbarOpen(true);
      });
  }

  function updateJobsList(page = 1) {
    JobPosting.getJobPosting(parseInt(id), page)
      .then((jobPostingList) => {
        if (jobPostingList.length > 0) {
          setJobs(jobPostingList);
          if (page !== curJobPostingPage) setcurJobPostingPage(page);
        }
      })
      .catch((err) => {
        setAlert({ type: "error", msg: err.message });
        setsnackbarOpen(true);
      });
  }

  const updateProfile = () => {
    if ((userId.length > 0 && !profile) || profile.id !== parseInt(id)) {
      User.profile(parseInt(id)).then(
        (pfile) => {
          if (pfile === null) {
            setAlert({ type: "error", msg: "This user does not exist" });
            setsnackbarOpen(true);
            navigate(`/not-found`);
          } else {
            setProfile(pfile);
            if (pfile.user_type === JOB_SEEKER) {
              if (profileExperiences.values.length === 0) {
                JobExperience.getJobExperience(parseInt(id)).then(
                  (jobExpList) => {
                    if (jobExpList.values.length > 0)
                      setprofileExperiences(jobExpList);
                  }
                );
              }
              if (education.values.length === 0) {
                Education.getEducation(parseInt(id)).then((educationList) => {
                  if (educationList.values.length > 0)
                    setEducation(educationList);
                });
              }
            } else if (pfile.user_type === EMPLOYER) {
              if (ratings.values.length === 0) {
                Review.getReviews(parseInt(id)).then((reviewList) => {
                  setRatings(reviewList);
                });
              }
              if (jobs.length === 0) {
                JobPosting.getJobPosting(parseInt(id), curJobPostingPage).then(
                  (jobpostingslist) => {
                    setJobs(jobpostingslist);
                  }
                );
              }
            }
          }
        },
        (err) => {
          setAlert({ type: "error", msg: err.message });
          setsnackbarOpen(true);
        }
      );
    }
  };

  const updateUser = () => {
    if (userId.length !== 0 && !user) {
      User.profile(parseInt(userId)).then((pfile) => {
        setUser(pfile);
      });
    }
  };

  useEffect(() => {
    if (userId.length === 0) {
      navigate(`/login`);
    } else {
      updateProfile();
      updateUser();
    }
  });

  function createEditButton(section) {
    if (profile && user && parseInt(userId) === parseInt(id)) {
      if (section === EXPERIENCE || section === EDUCATION) {
        return (
          <AddCircleIcon
            onClick={() => handleEditClick(section)}
            className="icon"
          />
        );
      } else {
        return (
          <EditIcon onClick={() => handleEditClick(section)} className="icon" />
        );
      }
    }
  }

  function createExperiences() {
    return (
      <Card className="pageCard">
        {createEditButton(EXPERIENCE)}
        <Card.Body>
          <div className="titleIconPair">
            <WorkIcon className="iconForTitle" sx={{ fontSize: 30 }} />
            <h3>Professional Experience</h3>
          </div>
          <div>
            {profileExperiences.values.length > 0 && curExpPage > 0 ? (
              <NavigateBeforeIcon
                className="prev-page-button"
                onClick={() => updateExpPage(curExpPage - 1)}
              />
            ) : (
              <></>
            )}
            {!profileExperiences.lastPage ? (
              <NavigateNextIcon
                className="next-page-button"
                onClick={() => updateExpPage(curExpPage + 1)}
              />
            ) : (
              <></>
            )}
          </div>
          <div className="profileList">
            {profileExperiences.values.map((exp) => {
              return (
                <div key={exp.id}>
                  {user.id === profile.id ? (
                    <DeleteIcon
                      onClick={() => removeJob(exp.id)}
                      className="icon"
                      sx={{ fontSize: 20 }}
                    />
                  ) : (
                    <div />
                  )}
                  <JobCard
                    key={exp.id}
                    posTitle={exp.title}
                    company={exp.company}
                    location={exp.country}
                    experience={exp.description}
                  />
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>
    );
  }

  function addRating(e) {
    e.preventDefault();
    let description = document.querySelector("#review-desc").value;
    Review.addReview(
      parseInt(user.id),
      parseInt(profile.id),
      value,
      description
    )
      .then((added) => {
        if (added) {
          setcurReviewsPage(0);
          updateReviews(0);
          setAlert({ type: "success", msg: "Review submitted." });
          setsnackbarOpen(true);
        } else {
          setAlert({ type: "error", msg: "Review already exists." });
          setsnackbarOpen(true);
        }
      })
      .catch((err) => {
        setAlert({ type: "error", msg: err.message });
        setsnackbarOpen(true);
      });
    document.querySelector("#rating-form").reset();
    setValue(0);
  }

  function createRatingForm() {
    return (
      <Card className="pageCard">
        <Card.Body>
          <h3>Leave us a rating!</h3>
          <Form
            id="rating-form"
            onSubmit={(e) => {
              addRating(e);
            }}
          >
            <Rating
              name="simple-controlled"
              value={value}
              onChange={(event, newValue) => {
                setValue(newValue);
              }}
            />
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Control id="review-desc" as="textarea" rows={3} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    );
  }

  function createJobList() {
    return (
      <Card className="pageCard">
        {createEditButton(JOBS)}
        <Card.Body>
          <div className="titleIconPair">
            <WorkIcon className="iconForTitle" sx={{ fontSize: 30 }} />
            <h3>Join the team!</h3>
          </div>
          {jobs.length > 0 && curJobPostingPage > 1 ? (
            <NavigateBeforeIcon
              className="prev-page-button"
              onClick={() => updateJPPage(curJobPostingPage - 1)}
            />
          ) : (
            <></>
          )}
          {jobs.length > 0 && jobs.length === 10 ? (
            <NavigateNextIcon
              className="next-page-button"
              onClick={() => updateJPPage(curJobPostingPage + 1)}
            />
          ) : (
            <></>
          )}
          <div className="profileList">
            {jobs &&
              jobs.map((job) => {
                return (
                  <div>
                    <JobCard
                      key={job.id}
                      posTitle={job.title}
                      company={profile.name}
                      location={job.location}
                      experience={job.description}
                    />
                    {user.user_type === JOB_SEEKER ? (
                      <Button
                        onClick={() =>
                          JobApp.applyJob(parseInt(user.id), job.id)
                            .then(() => {
                              setAlert({
                                type: "success",
                                msg: "Job Application success!",
                              });
                              setsnackbarOpen(true);
                            })
                            .catch((err) => {
                              setAlert({
                                type: "error",
                                msg: err.message,
                              });
                              setsnackbarOpen(true);
                            })
                        }
                      >
                        APPLY
                      </Button>
                    ) : (
                      <></>
                    )}
                  </div>
                );
              })}
          </div>
        </Card.Body>
      </Card>
    );
  }

  function createReviews() {
    return (
      <Card className="pageCard">
        <Card.Body>
          <div className="titleIconPair">
            <HailIcon className="iconForTitle" sx={{ fontSize: 30 }} />
            <h3>Reviews </h3>
          </div>
          {ratings.values.length > 0 && curReviewsPage > 0 ? (
            <NavigateBeforeIcon
              className="prev-page-button"
              onClick={() => updateReviewsPage(curReviewsPage - 1)}
            />
          ) : (
            <></>
          )}
          {!ratings.lastPage ? (
            <NavigateNextIcon
              className="next-page-button"
              onClick={() => updateReviewsPage(curReviewsPage + 1)}
            />
          ) : (
            <></>
          )}
          <Stack
            direction="column"
            justifyContent="flex-start"
            alignItems="stretch"
            spacing={1}
          >
            {ratings.values.map((review) => {
              return (
                <Item key={review.id}>
                  <Typography variant="h4" gutterBottom component="div">
                    <strong>{review.reviewer}</strong>
                  </Typography>
                  <Typography variant="h5" gutterBottom component="div">
                    Rating: {review.rating}/5 Stars
                  </Typography>
                  <Typography variant="h6" gutterBottom component="div">
                    {review.description}
                  </Typography>
                </Item>
              );
            })}
          </Stack>
        </Card.Body>
      </Card>
    );
  }

  function createAwards(edu) {
    if (edu.awards) {
      return (
        <div>
          <Typography variant="h5" gutterBottom component="div">
            <strong>Awards</strong>
          </Typography>
          {edu.awards}
        </div>
      );
    }
  }

  function createEducation() {
    return (
      <Card className="pageCard">
        {createEditButton(EDUCATION)}
        <Card.Body>
          <div className="titleIconPair">
            <SchoolIcon className="iconForTitle" sx={{ fontSize: 30 }} />
            <h3>Education </h3>
          </div>
          {education.values.length > 0 && curEducationPage > 0 ? (
            <NavigateBeforeIcon
              className="prev-page-button"
              onClick={() => updateEduPage(curEducationPage - 1)}
            />
          ) : (
            <></>
          )}
          {!education.lastPage ? (
            <NavigateNextIcon
              className="next-page-button"
              onClick={() => updateEduPage(curEducationPage + 1)}
            />
          ) : (
            <></>
          )}
          {education.values.length > 0 ? (
            <Stack
              direction="column"
              justifyContent="flex-start"
              alignItems="stretch"
              spacing={1}
            >
              {education.values.map((edu) => {
                return (
                  <div key={edu.id}>
                    {user.id === profile.id ? (
                      <DeleteIcon
                        onClick={() => removeEdu(edu.id)}
                        className="icon"
                        sx={{ fontSize: 20 }}
                      />
                    ) : (
                      <div />
                    )}
                    <Item key={edu.school + edu.degree}>
                      <Typography
                        key={edu.school}
                        variant="h4"
                        gutterBottom
                        component="div"
                      >
                        <strong>{edu.school}</strong>
                      </Typography>
                      <Typography
                        key={edu.degree}
                        variant="h5"
                        gutterBottom
                        component="div"
                      >
                        {edu.degree}
                      </Typography>
                      {edu.gpa ? (
                        <Typography
                          key={edu.gpa}
                          variant="h6"
                          gutterBottom
                          component="div"
                        >
                          GPA: {edu.gpa}
                        </Typography>
                      ) : (
                        <div></div>
                      )}
                      {createAwards(edu)}
                    </Item>
                  </div>
                );
              })}
            </Stack>
          ) : (
            <></>
          )}
        </Card.Body>
      </Card>
    );
  }

  function handleEditClick(type) {
    if (type === SUMMARY) {
      setUpdateSummaryDialog(true);
    } else if (type === EXPERIENCE) {
      setProfessionalExpDialog(true);
    } else if (type === EDUCATION) {
      setEduDialogOpen(true);
    } else if (type === JOBS) {
      navigate(`/job-posting`);
    }
  }
  return (
    <>
      {profile && user ? (
        <div className="page">
          <Card className="pageCard">
            {createEditButton(SUMMARY)}
            <Card.Body>
              <h3>
                <strong>{profile.name}</strong>
                <p className="text-muted h5">
                  {profile.location ? profile.location : "Not provided"}{" "}
                  <LocationOnIcon />
                </p>
              </h3>
              <p className="h5">
                <strong>About</strong>
              </p>
              <p className="h6">{profile.about}</p>
              {profile.user_type === EMPLOYER ? (
                <Button onClick={() => navigate(`/chatroom/${id}`)}>
                  Chatroom
                </Button>
              ) : (
                <></>
              )}
            </Card.Body>
          </Card>
          {profile && profile.user_type === JOB_SEEKER
            ? createEducation()
            : createReviews()}

          {profile && profile.user_type === JOB_SEEKER
            ? createExperiences()
            : createJobList()}
          {profile &&
          profile.user_type === EMPLOYER &&
          user.user_type === JOB_SEEKER ? (
            createRatingForm()
          ) : (
            <></>
          )}
          <Dialog
            id="updateSummaryDialog"
            open={updateSummaryDialog}
            onClose={handleCloseDialog}
          >
            <DialogTitle>Update your summary</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                id="name"
                label={profile.user_type === EMPLOYER ? "Company Name" : "Name"}
                defaultValue={profile.name}
                fullWidth
                variant="standard"
              />
              <TextField
                margin="dense"
                id="location"
                label="Location"
                defaultValue={profile.location}
                fullWidth
                variant="standard"
              />
              <TextField
                margin="dense"
                id="about"
                label="About"
                defaultValue={profile.about}
                fullWidth
                variant="standard"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleUpdateSummary}>Update</Button>
            </DialogActions>
          </Dialog>
          <Dialog
            id="addJobDialog"
            open={professionalExpDialog}
            onClose={handleCloseDialog}
          >
            <DialogTitle>Tell us about this position</DialogTitle>
            <DialogContent>
              <CountrySelect />
              <TextField
                autoFocus
                margin="dense"
                id="pos"
                label="Position"
                fullWidth
                variant="standard"
              />
              <TextField
                autoFocus
                margin="dense"
                id="company"
                label="Company"
                fullWidth
                variant="standard"
              />
              <TextField
                autoFocus
                margin="dense"
                id="desc"
                label="Description"
                fullWidth
                variant="standard"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleAddJob}>Add</Button>
            </DialogActions>
          </Dialog>
          <Dialog
            id="addEduDialog"
            open={eduDialogOpen}
            onClose={handleCloseDialog}
          >
            <DialogTitle>Tell us about your educational history</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="school"
                label="School"
                fullWidth
                variant="standard"
              />
              <TextField
                autoFocus
                margin="dense"
                id="degree"
                label="Degree"
                fullWidth
                variant="standard"
              />
              <TextField
                autoFocus
                margin="dense"
                id="gpa"
                label="GPA"
                fullWidth
                variant="standard"
              />
              <Autocomplete
                multiple
                id="awards"
                options={SAMPLE_AWARDS.map((option) => option.title)}
                freeSolo
                onChange={(e, value) => {
                  setAwards(value);
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="filled"
                    label="Awards"
                    placeholder="Your Awards"
                  />
                )}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleAddEdu}>Add</Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
          >
            <Alert
              onClose={handleSnackbarClose}
              severity={alert.type}
              sx={{ width: "100%" }}
            >
              {alert.msg}
            </Alert>
          </Snackbar>
        </div>
      ) : (
        <CircularProgress />
      )}
    </>
  );
}

export default Profile;
