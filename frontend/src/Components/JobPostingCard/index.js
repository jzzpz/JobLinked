import React, { useEffect, useState, useRef } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Form } from "react-bootstrap";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

import DatePicker from "react-datetime";
import moment from "moment";
import GenerateMeetingButton from "../meetingButton/";

import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

import JobApp from "../../Apis/jobApp";
import Interview from "../../Apis/interview";
import { useNavigate } from "react-router-dom";
import Link from "@mui/material/Link";

const JobPostingCard = ({
  curJPosting,
  deleteJobPosting,
  companyName,
  userId,
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [openInterviewDialog, setOpenInterviewDialog] = React.useState(false);
  const [applicants, setApplicants] = React.useState(null);
  const [curApplicant, setCurApplicant] = React.useState("");
  const [dt, setDt] = useState("");
  const [snackbarOpen, setsnackbarOpen] = React.useState(false);
  const [alert, setAlert] = React.useState("");
  const [updatingInterview, setUpdatingInterview] = React.useState(false);

  const handleClickOpen = () => () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setOpenInterviewDialog(false);
  };
  const descriptionElementRef = useRef(null);

  // only allow present date
  let disablePastDt = (current) => {
    let today = moment();
    return current.isAfter(today);
  };

  const scheduleInterview = async (e, applicant) => {
    setUpdatingInterview(true);
    e.preventDefault();
    if (dt) {
      // store the new interview in the db
      let result = await Interview.addInterview(
        applicant,
        userId,
        curJPosting.id,
        dt
      ).catch((err) => {
        setAlert(err.message);
        setsnackbarOpen(true);
      });
      if (!result) {
        setAlert("Unable to schedule interview");
        setsnackbarOpen(true);
      }
    } else {
      setAlert("Please set a time before scheduling");
      setsnackbarOpen(true);
    }
    // close dialog
    setDt("");
    setOpen(false);
    setOpenInterviewDialog(false);
    setUpdatingInterview(false);
  };

  useEffect(() => {
    const setCurJobApplicants = async (jobId) => {
      // get applciants for the job
      let curApplicants = await JobApp.getApplicants(jobId);
      setApplicants(curApplicants);
    };

    if (open || openInterviewDialog) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
    if (applicants === null) {
      setCurJobApplicants(curJPosting.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, openInterviewDialog]);

  const handleInterviewOpen = (app) => {
    setCurApplicant(app);
    setOpenInterviewDialog(true);
  };
  return (
    <div style={{ marginTop: "20px" }}>
      <Card sx={{ minWidth: 345 }} elvation={2}>
        <CardHeader
          action={
            <IconButton
              aria-label="delete posting"
              onClick={() => deleteJobPosting(curJPosting.id)}
            >
              <DeleteIcon />
            </IconButton>
          }
          title={curJPosting.title}
          subheader={companyName}
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            {"Posting Closing Date:" + curJPosting.deadline}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {"Location: " + curJPosting.location}
          </Typography>
        </CardContent>
        {applicants !== null && applicants.length > 0 && (
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              {"Current Applicants: "}
            </Typography>
            <div className="applicants">
              {applicants.map((app) => (
                <div
                  className="applicant-info"
                  style={{ margin: "5px", display: "flex" }}
                >
                  <Link
                    component="button"
                    underline="none"
                    color="inherit"
                    onClick={() => {
                      navigate(`/profile/${app.id}`);
                    }}
                  >
                    <Typography
                      variant="body3"
                      color="text.secondary"
                      style={{ margin: "5px" }}
                    >
                      {app.name}
                    </Typography>
                  </Link>
                  <Button
                    variant="outlined"
                    onClick={() => handleInterviewOpen(app)}
                  >
                    Schedule Meeting
                  </Button>
                  <GenerateMeetingButton
                    app={app}
                    userId={userId}
                    jobPosting={curJPosting}
                    curUpdating={updatingInterview}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        )}

        <CardActions
          disableSpacing
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button onClick={handleClickOpen("paper")}>See More</Button>
          <Dialog
            open={open}
            onClose={handleClose}
            scroll="paper"
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
          >
            <DialogTitle className="scroll-dialog-title">
              {curJPosting.title}
            </DialogTitle>
            <DialogContent dividers={true}>
              <DialogContentText
                className="scroll-dialog-description"
                ref={descriptionElementRef}
                tabIndex={-1}
                variant="standard"
              >
                {"Location: " + curJPosting.location}
              </DialogContentText>

              <DialogContentText
                className="scroll-dialog-description"
                ref={descriptionElementRef}
                tabIndex={-1}
                variant="standard"
              >
                {"Posting Deadline: " + curJPosting.deadline}
              </DialogContentText>
            </DialogContent>

            <DialogContent dividers={true}>
              <DialogContentText
                className="scroll-dialog-description dialog-field-header"
                ref={descriptionElementRef}
                tabIndex={-1}
                variant="standard"
              >
                {"Qualification:"}
              </DialogContentText>

              <DialogContentText
                className="scroll-dialog-description"
                ref={descriptionElementRef}
                tabIndex={-1}
              >
                {curJPosting.qualification}
              </DialogContentText>
            </DialogContent>

            <DialogContent dividers={true}>
              <DialogContentText
                className="scroll-dialog-description dialog-field-header"
                ref={descriptionElementRef}
                tabIndex={-1}
                variant="standard"
              >
                {"Key Descriptions:"}
              </DialogContentText>

              {JSON.parse(curJPosting.keyDescription).map((aKeyDescription) => (
                <DialogContentText
                  key={aKeyDescription}
                  className="scroll-dialog-description"
                  ref={descriptionElementRef}
                  tabIndex={-1}
                >
                  {aKeyDescription}
                </DialogContentText>
              ))}
            </DialogContent>

            <DialogContent dividers={true}>
              <DialogContentText
                className="scroll-dialog-description dialog-field-header"
                ref={descriptionElementRef}
                tabIndex={-1}
                variant="standard"
              >
                {"Description:"}
              </DialogContentText>

              <DialogContentText
                className="scroll-dialog-description "
                ref={descriptionElementRef}
                tabIndex={-1}
              >
                {curJPosting.description}
              </DialogContentText>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={openInterviewDialog}
            onClose={() => setOpenInterviewDialog(false)}
            scroll="paper"
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
            fullWidth
            maxWidth="l"
            maxLength="l"
          >
            <DialogTitle className="scroll-dialog-title">
              Schedule Meeting
            </DialogTitle>
            <DialogContent dividers={true} style={{ minHeight: "50vh" }}>
              <Form
                id="interview-scheduler"
                onSubmit={(e) => scheduleInterview(e, curApplicant.id)}
              >
                <Form.Group>
                  <Typography variant="h6" gutterBottom component="div">
                    Schedule meeting with {curApplicant.name}
                  </Typography>
                  <DatePicker
                    className="interview-time"
                    inputProps={{
                      style: { width: 250 },
                    }}
                    isValidDate={(val) => disablePastDt(val)}
                    dateFormat="DD-MM-YYYY"
                    timeFormat="hh:mm A"
                    onChange={(val) => setDt(val)}
                  />
                </Form.Group>
                <DialogActions>
                  <Button type="submit">Schedule</Button>
                  <Button onClick={handleClose}>Close</Button>
                </DialogActions>
              </Form>
            </DialogContent>
          </Dialog>
        </CardActions>
      </Card>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setsnackbarOpen(false)}
      >
        <Alert
          onClose={() => setsnackbarOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {alert}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default JobPostingCard;
