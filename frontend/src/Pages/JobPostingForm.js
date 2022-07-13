import React from "react";
import "react-datetime/css/react-datetime.css";
import "../Styles/jobPosting.css";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { RiDeleteBack2Fill } from "react-icons/ri";
import { Form, Button } from "react-bootstrap";
import { useState } from "react";
import User from "../Apis/user";
import JobPosting from "../Apis/jobPosting";
import DatePicker from "react-datetime";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const JobPostingForm = () => {
  const [dt, setDt] = useState("");
  const [jdSentences, setjdSentences] = useState([]);
  const [alert, setAlert] = React.useState("");
  const [snackbarOpen, setsnackbarOpen] = React.useState(false);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setsnackbarOpen(false);
  };
  let navigate = useNavigate();
  // prevent form from submitting when pressing Enter for type="text"
  let keyPressHandler = (e) => {
    if (e.key === "Enter") e.preventDefault();
  };

  // only allow present date
  let disablePastDt = (current) => {
    let today = moment();
    return current.isAfter(today);
  };

  let jDescKeyPressHandler = (e) => {
    let sentence = e.target.value;
    if (e.key !== "Enter" || sentence.trim().length === 0) return;
    e.preventDefault();
    if (jdSentences.length >= 5) {
      return;
    }
    if (jdSentences.includes(sentence)) {
      return;
    }
    setjdSentences([...jdSentences, sentence]);
    document.querySelector(".job-desc-sentences").value = "";
  };

  let deleteSentence = (jdSentence) => {
    setjdSentences(jdSentences.filter((sentence) => sentence !== jdSentence));
  };

  // this function will be called whenever "Enter" at any of the field
  let submitJobPostingForm = async (e) => {
    e.preventDefault();
    let authorId = parseInt(User.getId());
    let jTitle = document.querySelector(".job-title").value;
    let jLocation = document.querySelector(".job-location").value;
    let jQualification = document.querySelector(".job-qualification").value;
    let jDescription = document.querySelector(".job-desc-long").value;
    let jDeadline = dt.toDate().toString();

    await JobPosting.createJobPosting(
      authorId,
      jTitle,
      jLocation,
      jQualification,
      JSON.stringify(jdSentences),
      jDescription,
      jDeadline
    ).then(
      (isadded) => {
        if (isadded) {
          navigate(`/job-posting`);
        }
      },
      (err) => {
        setAlert(err.message);
        setsnackbarOpen(true);
      }
    );
  };

  return (
    <div className="page">
      <h1>Create a Job Posting</h1>
      <Form className="pageCard" id="job-posting-form" onSubmit={submitJobPostingForm}>
        <Form.Group className="mb-3">
          <Form.Label>Job Title</Form.Label>
          <Form.Control
            className="job-title"
            type="text"
            onKeyPress={(e) => keyPressHandler(e)}
            placeholder="Enter Job Title"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Job Location</Form.Label>
          <Form.Control
            className="job-location"
            type="text"
            onKeyPress={(e) => keyPressHandler(e)}
            placeholder="Enter Job Location"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Job Description Key Sentence (upto five key sentences)</Form.Label>
          <Form.Control
            className="job-desc-sentences"
            type="text"
            onKeyPress={(e) => jDescKeyPressHandler(e)}
            placeholder="Enter a Description"
          />
        </Form.Group>

        <div className="added-job-desc-sentences">
          {jdSentences
            ? jdSentences.map((jdSentence) => (
                <div className="job-desc-sentence" key={jdSentence}>
                  <p>{jdSentence}</p>
                  <RiDeleteBack2Fill
                    onClick={() => {
                      deleteSentence(jdSentence);
                    }}
                  />
                </div>
              ))
            : ""}
        </div>

        <Form.Group className="mb-3">
          <Form.Label>Job Qualifications </Form.Label>
          <Form.Control
            className="job-qualification"
            as="textarea"
            rows={5}
            type="text"
            placeholder="Enter Qualification"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Job Description Overview</Form.Label>
          <Form.Control
            className="job-desc-long"
            as="textarea"
            rows={10}
            type="text"
            placeholder="Enter Job Description"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Select Job Posting Deadline</Form.Label>
          <DatePicker
            className="job-deadline"
            inputProps={{
              style: { width: 250 },
            }}
            value={dt || ""}
            isValidDate={(val) => disablePastDt(val)}
            dateFormat="DD-MM-YYYY"
            timeFormat="hh:mm A"
            onChange={(val) => setDt(val)}
          />
        </Form.Group>

        <Button id="submit" variant="primary" type="submit">
          Create Posting
        </Button>
      </Form>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: "100%" }}>
          {alert}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default JobPostingForm;
