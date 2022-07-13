import React, { useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import { Form } from "react-bootstrap";
import DialogActions from "@mui/material/DialogActions";
import "./enhancedJobCard.css";
import JobApp from "../../Apis/jobApp";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import JobCard from "../JobCard";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import "bootstrap/dist/css/bootstrap.min.css";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Link from "@mui/material/Link";

const EnhancedJobCard = (props) => {
  const [cardOpen, setCardOpen] = React.useState(false);
  const [applyOpen, setApplyOpen] = React.useState(false);
  const [snackbarOpen, setsnackbarOpen] = React.useState(false);
  const [alert, setAlert] = React.useState("");
  const [haveApplied, setHaveApplied] = React.useState(false);

  const navigate = useNavigate();

  const handleCardClick = () => {
    setCardOpen(true);
  };

  const handleClose = () => {
    setCardOpen(false);
  };
  const applyJob = async (e) => {
    e.preventDefault();
    // apply for the job then close the job info dialog
    await JobApp.applyJob(props.userId, props.jobId).catch((err) => {
      setAlert(err.message);
      setsnackbarOpen(true);
    });
    setApplyOpen(false);
    setCardOpen(false);
    setHaveApplied(true);
  };
  // get the deadline in day/month/year format
  const dateDeadline = new Date(props.deadline);
  const simpleDateString = `${dateDeadline.getUTCDate()}/${
    dateDeadline.getUTCMonth() + 1
  }/${dateDeadline.getUTCFullYear()}`;

  useEffect(() => {
    setHaveApplied(props.haveApplied);
  }, [props.haveApplied]);
  return (
    <>
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
      <div className="enhanced-job-card">
        <div
          className={haveApplied ? "haveApplied simple-view" : "simple-view"}
          onClick={handleCardClick}
        >
          <JobCard
            key={props.jobId}
            posTitle={props.posTitle}
            company={props.company}
            location={props.location}
            experience={props.experience}
          />
        </div>
        <Dialog
          className="enhanced-view"
          fullWidth
          maxWidth="xl"
          open={cardOpen}
          scroll="body"
          onClose={handleClose}
        >
          <DialogTitle>
            {props.company} - {props.posTitle}
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="h6" gutterBottom component="div">
              {props.company}
              <Link
                component="button"
                underline="none"
                color="inherit"
                onClick={() => {
                  navigate(`/profile/${props.authorId}`);
                }}
                style={{ margin: "10px" }}
              >
                <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{
                    display: {
                      xs: "none",
                      sm: "block",
                      border: "2px solid black",
                      padding: "2px",
                    },
                  }}
                >
                  Visit their Profile
                </Typography>
              </Link>
            </Typography>
            <Typography variant="h5" gutterBottom component="div">
              {<strong> Basic Information </strong>}
            </Typography>
            <Typography variant="h6" gutterBottom component="div">
              Location: {props.location}
            </Typography>
            <Typography variant="h6" gutterBottom component="div">
              Deadline: {simpleDateString}
            </Typography>
            <Typography variant="h6" gutterBottom component="div">
              Position: {props.posTitle}
            </Typography>
            <Typography variant="h5" gutterBottom component="div">
              {<strong> Description </strong>}
            </Typography>
            <Typography variant="h6" gutterBottom component="div">
              {props.longDescription}
            </Typography>
            <Typography variant="h5" gutterBottom component="div">
              {<strong> Qualifications </strong>}
            </Typography>
            <Typography variant="h6" gutterBottom component="div">
              {props.qualifications}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            <Button onClick={() => setApplyOpen(true)}>Apply</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          className="applyForm"
          fullWidth
          maxWidth="md"
          open={applyOpen}
          scroll="body"
          onClose={() => setApplyOpen(false)}
        >
          <DialogTitle>Apply</DialogTitle>
          <DialogContent dividers>
            <Form onSubmit={applyJob}>
              <Form.Group>
                <Typography variant="h6" gutterBottom component="div">
                  Do you wish to apply for this job?
                </Typography>
              </Form.Group>
              <Form.Group className="mb-3">
                <Button type="submit">Apply</Button>
              </Form.Group>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default EnhancedJobCard;
