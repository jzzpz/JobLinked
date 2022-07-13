import React, { useEffect } from "react";
import { Form, Button, Card } from "react-bootstrap";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/icons.css";
import "../Styles/pages.css";
import "../Styles/card.css";
import { useNavigate } from "react-router-dom";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CountrySelect from "../Components/CountrySelect";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { JOB_SEEKER } from "../Constants/user";
import { SAMPLE_AWARDS } from "../Constants/profile";
import JobCard from "../Components/JobCard";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import User from "../Apis/user";
import Education from "../Apis/education";
import JobExperience from "../Apis/jobExperience";

function AdditionalInfo() {
  const [user, setUser] = React.useState(undefined);
  const [jobExpDialogOpen, setjobExpDialogOpen] = React.useState(false);
  const [eduDialogOpen, setEduDialogOpen] = React.useState(false);
  const [awards, setAwards] = React.useState([]);
  const [jobExp, setJobExp] = React.useState([]);
  const [edu, setEdu] = React.useState([]);
  const [snackbarOpen, setsnackbarOpen] = React.useState(false);
  const userId = User.getId();
  const [alert, setAlert] = React.useState("");
  let navigate = useNavigate();

  function validateSignup() {
    let about = document.querySelector("#about").value;
    let location = document.querySelector("#country-select").value;
    return about.length > 5 && location.length > 0;
  }

  function onSubmit(e) {
    e.preventDefault();
    let valid = validateSignup();
    if (!valid) {
      setAlert("Form is not completed.");
      setsnackbarOpen(true);
    } else {
      let about = document.querySelector("#about").value;
      let location = document.querySelector("#country-select").value;
      User.updateAbout(user.id, user.name, location, about)
        .then(() => {
          edu.forEach((education) => {
            Education.addEducation(
              education.school,
              education.degree,
              education.gpa.length > 0 ? education.gpa : "NULL",
              education.awards.length > 0 ? education.awards : "NULL",
              parseInt(user.id)
            )
              .then(() => {
                jobExp.forEach((job) => {
                  JobExperience.addJobExperience(
                    job.title,
                    job.country,
                    job.desc,
                    job.company,
                    parseInt(user.id)
                  ).catch((err) => {
                    setAlert(err.message);
                    setsnackbarOpen(true);
                  });
                });
              })
              .catch((err) => {
                setAlert(err.message);
                setsnackbarOpen(true);
              });
          });
          navigate(`/profile/${userId}`);
        })
        .catch((err) => {
          setAlert(err.message);
          setsnackbarOpen(true);
        });
    }
  }

  const handleExperienceClick = () => {
    setjobExpDialogOpen(true);
  };

  const handleEducationClick = () => {
    setEduDialogOpen(true);
  };

  const handleClose = () => {
    setjobExpDialogOpen(false);
    setEduDialogOpen(false);
  };

  const handleAddJob = () => {
    let form = document.querySelector("#addJobDialog");
    let country = form.querySelector("#country-select").value;
    let pos = form.querySelector("#pos").value;
    let company = form.querySelector("#company").value;
    let desc = form.querySelector("#desc").value;
    let newJob = {
      id: pos + desc + company,
      title: pos,
      country: country,
      company: company,
      desc: desc,
    };
    setJobExp(jobExp.concat([newJob]));
    setjobExpDialogOpen(false);
  };
  const handleAddEdu = () => {
    let form = document.querySelector("#addEduDialog");
    let school = form.querySelector("#school").value;
    let degree = form.querySelector("#degree").value;
    let gpa = form.querySelector("#gpa").value;
    let newEdu = {
      id: school + degree,
      school: school,
      degree: degree,
      gpa: gpa,
      awards: awards.join(" | "),
    };
    setEdu(edu.concat([newEdu]));
    setEduDialogOpen(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setsnackbarOpen(false);
  };

  function removeEdu(id) {
    let removedEdu = edu.filter((element) => {
      return element.id !== id;
    });
    setEdu(removedEdu);
  }

  function removeJob(id) {
    let removedJobs = jobExp.filter((element) => {
      return element.id !== id;
    });
    setJobExp(removedJobs);
  }

  function createJobs() {
    return jobExp.map((job) => {
      return (
        <div>
          <DeleteIcon
            onClick={() => removeJob(job.id)}
            className="icon"
            sx={{ fontSize: 20 }}
          />
          <JobCard
            id={job.id}
            posTitle={job.title}
            company={job.company}
            location={job.country}
            experience={job.desc}
          />
        </div>
      );
    });
  }

  function createEdu() {
    return edu.map((edu) => {
      return (
        <div>
          <DeleteIcon
            onClick={() => removeEdu(edu.id)}
            className="icon"
            sx={{ fontSize: 20 }}
          />
          <JobCard
            id={edu.id}
            posTitle={edu.school}
            company={edu.degree}
            location={"GPA: " + edu.gpa}
            experience={"Awards: " + edu.awards}
          />
        </div>
      );
    });
  }

  const updateProfile = async () => {
    if (userId.length === 0) navigate(`/login`);
    else if (userId.length > 0 && !user) {
      let pfile = await User.profile(parseInt(userId));
      setUser(pfile);
    }
  };
  useEffect(() => {
    function callback() {
      updateProfile();
    }
    callback();
  });

  return (
    <>
      {user ? (
        <div className="page">
          <Card className="pageCard">
            <h3>
              <strong>
                {user.user_type === JOB_SEEKER
                  ? "Let's get to know you."
                  : "Tell us more about " + user.name}
              </strong>
            </h3>
            <Form id="user-details-form" onSubmit={onSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>About</Form.Label>
                <Form.Control id="about" as="textarea" rows={3} />
              </Form.Group>
              {user.user_type === JOB_SEEKER ? (
                <Form.Group className="mb-3">
                  <AddCircleIcon
                    className="icon"
                    onClick={() => handleEducationClick()}
                  />
                  <Form.Label>Education</Form.Label>
                  <div id="educationList">
                    {edu.length > 0 ? (
                      createEdu()
                    ) : (
                      <Alert variant="outlined" severity="info">
                        Add your educational history by clicking the add symbol
                        on the right!
                      </Alert>
                    )}
                  </div>
                </Form.Group>
              ) : (
                <></>
              )}
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <CountrySelect />
              </Form.Group>
              {user.user_type === JOB_SEEKER ? (
                <Form.Group className="mb-3">
                  <AddCircleIcon
                    className="icon"
                    onClick={() => handleExperienceClick()}
                  />
                  <Form.Label>Professional Experience</Form.Label>
                  <div id="jobsList">
                    {jobExp.length > 0 ? (
                      createJobs()
                    ) : (
                      <Alert variant="outlined" severity="info">
                        Add your professional experiences by clicking the add
                        symbol on the right!
                      </Alert>
                    )}
                  </div>
                </Form.Group>
              ) : (
                <></>
              )}
              <Button id="submit" variant="primary" type="submit">
                Complete Signup
              </Button>
            </Form>
          </Card>
          <Dialog
            id="addJobDialog"
            open={jobExpDialogOpen}
            onClose={handleClose}
          >
            <DialogTitle>Tell us about this position</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Employers will be able to view your job experiences on your
                profile page.
              </DialogContentText>
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
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleAddJob}>Add</Button>
            </DialogActions>
          </Dialog>
          <Dialog id="addEduDialog" open={eduDialogOpen} onClose={handleClose}>
            <DialogTitle>Tell us about your educational history</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Provide your relevant education history which will be displayed
                on your profile.
              </DialogContentText>
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
              <Button onClick={handleClose}>Cancel</Button>
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
              severity="error"
              sx={{ width: "100%" }}
            >
              {alert}
            </Alert>
          </Snackbar>
        </div>
      ) : (
        <CircularProgress />
      )}
    </>
  );
}

export default AdditionalInfo;
