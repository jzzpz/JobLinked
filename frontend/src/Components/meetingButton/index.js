import Interview from "../../Apis/interview";
import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import "./styles/meetingButton.css";

export default function GenerateMeetingButton(props) {
  const { app, userId, jobPosting } = props;
  const [curInterview, setCurInterview] = React.useState(null);
  const [snackbarOpen, setsnackbarOpen] = React.useState(false);
  const [alert, setAlert] = React.useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const updateCurInterview = async () => {
      // get the current interview from db
      const updatedInterview =
        await Interview.getInterviewByEmployerAndEmployee(
          userId,
          app.id,
          jobPosting.id
        );
      setCurInterview(updatedInterview);
    };
    updateCurInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  const deleteInterview = async (id) => {
    // delete the interview from db
    const deleted = await Interview.deleteInterview(id).catch((err) => {
      setAlert(err.message);
      setsnackbarOpen(true);
    });
    if (deleted) {
      setCurInterview(null);
    }
  };
  return curInterview !== null ? (
    <>
      <div className="interview-link">
        <div className="join-meeting">
          <Typography variant="body2" color="text.secondary">
            {"Scheduled Interview Time:" + curInterview.date_time}
          </Typography>
          <Button
            onClick={() => {
              navigate(`/interview/${curInterview.id}`);
            }}
            className="icon"
            variant="contained"
          >
            Join Meeting
          </Button>
        </div>
        <DeleteIcon
          onClick={() => deleteInterview(curInterview.id)}
          className="icon"
          sx={{ fontSize: 20 }}
        />
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
    </>
  ) : (
    <></>
  );
}
