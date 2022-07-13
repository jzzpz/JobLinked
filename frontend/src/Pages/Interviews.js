import React, { useState, useRef, useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/icons.css";
import "../Styles/pages.css";
import "../Styles/card.css";
import "../Styles/interview.css";
import { JOB_SEEKER } from "../Constants/user";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import User from "../Apis/user";
import Box from "@mui/material/Box";
import { Typography, makeStyles, Button } from "@material-ui/core";
import Interview from "../Apis/interview";

import { io } from "socket.io-client";
import Peer from "simple-peer";

const useStyles = makeStyles((theme) => ({
  video: {
    width: "550px",
    [theme.breakpoints.down("xs")]: {
      width: "300px",
    },
  },
  paper: {
    padding: "10px",
    border: "2px solid black",
    margin: "10px",
  },
}));

let socket = null;
function Interviews() {
  const [user, setUser] = React.useState(undefined);
  const [curInterview, setCurInterview] = React.useState(undefined);
  const [snackbarOpen, setsnackbarOpen] = React.useState(false);
  const [alert, setAlert] = React.useState("");
  const userId = User.getId();
  let navigate = useNavigate();

  let { interviewid } = useParams();
  interviewid = parseInt(interviewid);

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
          setName(pfile.name);
        },
        (err) => {
          setAlert(err.message);
          setsnackbarOpen(true);
        }
      );
    }
  };

  const updateInterview = async () => {
    if (userId.length > 0 && !curInterview) {
      let intview;
      try {
        intview = await Interview.getInterview(interviewid);
        let employerP = await User.profile(intview.employer);
        let employeeP = await User.profile(intview.employee);
        setCurInterview({
          employer: employerP.name,
          employee: employeeP.name,
          jobTitle: intview.position,
          employeeId: intview.employee,
          employerId: intview.employer,
        });
      } catch (error) {
        console.error(error.message);
        setAlert(error.message);
        setsnackbarOpen(true);
      }
    }
  };
  /**
   * WebRTC code are from https://github.com/adrianhajdin/project_video_chat
   */
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState(null);
  const [call, setCall] = useState({});
  const [name, setName] = useState("Other User ");

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  let cleanPage = () => {
    if (connectionRef.current) connectionRef.current.destroy();
    if (myVideo.current && myVideo.current.srcObject) {
      myVideo.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    if (socket) {
      socket.disconnect();
      socket.off();
    }
  };

  const getUserMedia = async () => {
    try {
      let currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(currentStream);
      myVideo.current.srcObject = currentStream;
    } catch (err) {
      setAlert("Unable to Connect Webcam");
      setsnackbarOpen(true);
    }
  };
  // =================================================================================================
  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: myVideo.current.srcObject,
    });
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: call.from });
    });
    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });
    peer.signal(call.signal);
    connectionRef.current = peer;
  };
  // =================================================================================================
  const callUser = (id, myId) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: myVideo.current.srcObject,
    });
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: myId,
        name,
      });
    });
    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });
    socket.on("callAccepted", (signal) => {
      setCallEnded(false);
      setCallAccepted(true);
      peer.signal(signal);
    });
    connectionRef.current = peer;
  };
  // =================================================================================================
  const leaveCall = () => {
    setCallEnded(true);
    cleanPage();
    user.user_type === "EMPLOYER"
      ? navigate(`/job-posting/`)
      : navigate(`/my-interviews/`);
  };
  useLayoutEffect(() => {
    getUserMedia();
    socket = io("https://job-linked.me/");
    socket.on("connect", () => {
      socket.emit("joinRoom", interviewid);

      socket.on("inRoom", (id) => {
        if (myVideo.current) {
          callUser(id, socket.id);
        }
      });
      socket.on("callUser", ({ signal, from, name: callerName }) => {
        setCall({ isReceivingCall: true, from, name: callerName, signal });
      });

      socket.on("callEnded", () => {
        setCall({ ...call, isReceivingCall: false });
        setCallEnded(true);
        setCallAccepted(false);
        if (!connectionRef) connectionRef.current.destroy();
      });
    });

    updateProfile();
    updateInterview();
    return function cleanup() {
      // close my and other user's webcam after leaving page
      cleanPage();
    };
  }, []);

  const classes = useStyles();
  return (
    <>
      {user &&
      curInterview &&
      (user.user_type === "EMPLOYER"
        ? user.id === curInterview.employerId
        : user.id === curInterview.employeeId) ? (
        <div className="page">
          <Card className="pageCard">
            <Typography variant="h2" align="center">
              Interview with{" "}
              {user.user_type === JOB_SEEKER
                ? curInterview.employer
                : curInterview.employee}{" "}
              for {curInterview.jobTitle}
            </Typography>

            {!call.isReceivingCall && !callAccepted && (
              <Typography
                variant="h6"
                align="center"
                style={{ paddingTop: "10px", color: "blue" }}
              >
                Waitting for the other user to join
              </Typography>
            )}

            {call.isReceivingCall && !callAccepted && (
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <h2 style={{ color: "blue" }}>
                  {call.name} is already in the interview
                </h2>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={answerCall}
                >
                  Start Interview
                </Button>
              </div>
            )}

            <div id="video-players">
              {stream && (
                <Box className={classes.paper} elevation={6}>
                  <video
                    playsInline
                    muted
                    ref={myVideo}
                    autoPlay
                    style={{ width: "100%", height: "100%" }}
                  />
                </Box>
              )}
              {callAccepted && !callEnded && userVideo && (
                <Box className={classes.paper} elevation={6}>
                  <video
                    playsInline
                    ref={userVideo}
                    autoPlay
                    style={{ width: "100%", height: "100%" }}
                  />
                </Box>
              )}
            </div>

            {callAccepted && !callEnded && (
              <Box textAlign="center">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={leaveCall}
                >
                  Leave Interview
                </Button>
              </Box>
            )}
          </Card>
        </div>
      ) : (
        <CircularProgress />
      )}
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
    </>
  );
}

export default Interviews;
