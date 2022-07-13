import React, { useEffect } from "react";
import { Card } from "react-bootstrap";
import Button from "@mui/material/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/icons.css";
import "../Styles/pages.css";
import "../Styles/card.css";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import User from "../Apis/user";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import WorkIcon from "@mui/icons-material/Work";
import Interview from "../Apis/interview";

function MyInterviews() {
  const [user, setUser] = React.useState(undefined);
  const [interviewList, setInterviewList] = React.useState([]);
  const [snackbarOpen, setsnackbarOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [isLastPage, setIsLastPage] = React.useState(0);
  const userId = User.getId();
  const [alert, setAlert] = React.useState("");
  let navigate = useNavigate();

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setsnackbarOpen(false);
  };

  const updateProfile = async () => {
    if (userId.length === 0) navigate(`/login`);
    else if (userId.length > 0 && !user) {
      User.profile(parseInt(userId)).then(
        (pfile) => {
          setUser(pfile);
        },
        (err) => {
          setAlert(err.message);
        }
      );
    }
  };

  const updatePage = (increment) => {
    let newPage = page;
    if (increment) {
      newPage++;
    } else {
      newPage--;
    }
    setPage(newPage);
  };

  const updateInterview = async (page) => {
    if (userId.length > 0) {
      let intview = await Interview.getUserInterviews(parseInt(userId), page);
      setInterviewList(intview.interviews);
      setIsLastPage(intview.isLastPage);
    }
  };

  useEffect(() => {
    function callback() {
      updateProfile();
      updateInterview(page);
    }
    callback();
  }, [page]);

  return (
    <>
      {user ? (
        <div className="page">
          <Card className="pageCard">
            <h3>
              <strong>Your Current Interviews</strong>
            </h3>
            <List sx={{ width: "100%", bgcolor: "background.paper" }}>
              {interviewList.length > 0 ? (
                interviewList.map((curInterview) => {
                  return (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <WorkIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          curInterview.company + " - " + curInterview.position
                        }
                        secondary={curInterview.date_time}
                      />
                      <Button
                        onClick={() => {
                          navigate(`/interview/${curInterview.id}`);
                        }}
                        className="icon"
                        variant="contained"
                      >
                        Join Meeting
                      </Button>
                    </ListItem>
                  );
                })
              ) : (
                <div>
                  You have no scheduled interviews at the moment. Start
                  Applying!
                </div>
              )}
            </List>
            <Button
              disabled={page === 0}
              onClick={() => updatePage(false)}
              variant="outlined"
            >
              Prev
            </Button>
            <Button
              disabled={isLastPage}
              onClick={() => updatePage(true)}
              variant="outlined"
            >
              Next
            </Button>
          </Card>
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

export default MyInterviews;
