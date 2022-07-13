import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "react-bootstrap";
import { Form, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/icons.css";
import "../Styles/pages.css";
import "../Styles/card.css";
import "../Styles/interview.css";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import User from "../Apis/user";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import SendIcon from "@mui/icons-material/Send";

const HOST = window.location.origin.replace(/^http/, "ws");
const ws = new WebSocket(HOST);

function ChatRoom() {
  const [user, setUser] = React.useState(undefined);
  const [snackbarOpen, setsnackbarOpen] = React.useState(false);
  const userId = User.getId();
  const [alert, setAlert] = React.useState("");
  const textInput = React.useRef(null);
  let navigate = useNavigate();
  let { id } = useParams();
  ws.onmessage = function (msg) {
    var response = JSON.parse(msg.data);
    if (response.chatroomId === id) addMessage(response.name, response.msg);
  };

  let addMessage = (name, msg) => {
    let msgs = document.querySelector("#messages");
    let new_msg = document.createElement("div");
    new_msg.className = "user-message";
    new_msg.innerHTML = `${name} said: ${msg}`;
    msgs.appendChild(new_msg);
  };

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

  let onSubmit = async (e) => {
    e.preventDefault();
    const msg = document.querySelector("#user-input").value;
    const new_msg = { name: user.name, msg: msg, chatroomId: id };
    addMessage("You", new_msg.msg);
    ws.send(JSON.stringify(new_msg));
    textInput.current.value = "";
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
              <strong>Chatroom</strong>
            </h3>
            <Form id="message-form" onSubmit={onSubmit}>
              <Form.Group className="mb-3">
                <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                  <AccountCircle sx={{ color: "action.active", mr: 1, my: 0.5 }} />
                  <TextField
                    fullWidth
                    required
                    inputRef={textInput}
                    id="user-input"
                    label="Message"
                    variant="standard"
                  />
                  <Button type="submit" variant="contained" color="primary">
                    <SendIcon />
                  </Button>
                </Box>
              </Form.Group>
            </Form>
          </Card>
          <Card className="pageCard">
            <Box sx={{ width: "100%" }}>
              <Stack spacing={2} id="messages"></Stack>
            </Box>
          </Card>
          <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
            <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: "100%" }}>
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

export default ChatRoom;
