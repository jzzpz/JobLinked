import React, { useEffect } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { Link } from "react-router-dom";
import User from "../Apis/user";
import jobPosting from "../Apis/jobPosting";
import JobPostingCard from "../Components/JobPostingCard/index.js";
import CircularProgress from "@mui/material/CircularProgress";

const JobPosting = () => {
  const userId = parseInt(User.getId());
  const [jPostings, setJPostings] = React.useState([]);
  const [jProfile, setJProfile] = React.useState(undefined);
  const [jPostingPage, setjPostingPage] = React.useState(1);
  const [isLastPage, setIsLastPage] = React.useState(false);
  const [snackbarOpen, setsnackbarOpen] = React.useState(false);
  const [alert, setAlert] = React.useState("");
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setsnackbarOpen(false);
  };

  useEffect(() => {
    let getJPostings = async () => {
      try {
        let postings = await jobPosting.getJobPosting(userId, jPostingPage);
        let nextPagePostings = await jobPosting.getJobPosting(userId, jPostingPage + 1);
        if (postings.length !== 10 || nextPagePostings.length === 0) {
          setIsLastPage(true);
        } else {
          setIsLastPage(false);
        }
        setJPostings(postings);
      } catch (error) {
        setAlert(error.message);
        setsnackbarOpen(true);
      }
    };

    let getJProfile = async () => {
      try {
        let profile = await User.profile(userId);
        setJProfile(profile);
      } catch (error) {
        setAlert(error.message);
        setsnackbarOpen(true);
      }
    };
    if (!isNaN(userId)) {
      getJPostings();
      getJProfile();
    }
  }, [jPostingPage]);
  let deleteJobPosting = async (id) => {
    try {
      let res = await jobPosting.deleteJobPosting(id);
      if (res) setJPostings(jPostings.filter((posting) => posting.id !== id)); // need this to update the state
    } catch (error) {
      setAlert(error.message);
      setsnackbarOpen(true);
    }
  };

  let prevJPostingPage = () => {
    setjPostingPage(jPostingPage - 1);
  };
  let nextJPostingPage = () => {
    setjPostingPage(jPostingPage + 1);
  };

  return isNaN(userId) ? (
    <CircularProgress />
  ) : (
    <div className="page">
      <Card sx={{ minWidth: 275, marginTop: "10px" }}>
        <CardContent>
          <h3>
            <strong>Your Job Postings</strong>
          </h3>
        </CardContent>

        <CardActions style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link to="/job-posting/job-posting-form">
            <Button variant="contained">Create Job Posting</Button>
          </Link>
        </CardActions>
      </Card>

      <div id="job-postings" style={{ display: "flex", flexDirection: "column" }}>
        {jPostings.map((curJPosting) => (
          <JobPostingCard
            key={curJPosting.id}
            curJPosting={curJPosting}
            deleteJobPosting={deleteJobPosting}
            companyName={jProfile ? jProfile.name : ""}
            userId={userId}
          />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "5px" }}>
        <Button
          disabled={jPostingPage === 1}
          variant="outlined"
          onClick={() => {
            prevJPostingPage();
          }}
        >
          {" "}
          Prev{" "}
        </Button>
        <Button
          disabled={isLastPage}
          variant="outlined"
          onClick={() => {
            nextJPostingPage();
          }}
        >
          {" "}
          Next{" "}
        </Button>
      </div>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: "100%" }}>
          {alert}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default JobPosting;
