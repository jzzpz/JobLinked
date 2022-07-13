import React from "react";
import { useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/home.css";
import "../Styles/pages.css";
import "../Styles/card.css";
import { useNavigate } from "react-router-dom";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import User from "../Apis/user";
import { EMPLOYER, JOB_SEEKER } from "../Constants/user";

function Signup() {
  const [userType, setUserType] = React.useState(0);
  const [snackbarOpen, setsnackbarOpen] = React.useState(false);
  const [alert, setAlert] = React.useState("");
  let userId = User.getId();
  let navigate = useNavigate();

  const redirectSignedInUsers = async () => {
    if (userId.length > 0) {
      navigate(`/profile/${userId}`);
    }
  };

  useEffect(() => {
    function callback() {
      redirectSignedInUsers();
    }
    callback();
  });
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setsnackbarOpen(false);
  };

  let onSubmit = async (e) => {
    e.preventDefault();

    let pw = document.querySelector("#pw").value;
    let email = document.querySelector("#email").value;
    let name = document.querySelector("#name").value;

    if (validateSignUp(pw, userType, name)) {
      document.querySelector("#signup-form").reset();
      await User.signUp(name, pw, email, userType).then(
        (result) => {
          User.login(email, pw).then(
            (id) => {
              if (id) navigate(`/complete-profile`);
            },
            (err) => {
              setAlert(err.message);
              setsnackbarOpen(true);
            }
          );
        },
        (err) => {
          setAlert(err.message);
          setsnackbarOpen(true);
        }
      );
    } else {
      setAlert("Form is not complete.");
      setsnackbarOpen(true);
    }
  };

  function validateSignUp(pw, userType, name) {
    return pw.length >= 5 && userType !== 0 && name.length >= 2;
  }

  const handleChange = (event) => {
    setUserType(event.target.value);
  };

  function displayRemainingForm() {
    if (userType !== 0) {
      return (
        <>
          <Form.Group className="mb-3">
            <Form.Label>
              {userType === JOB_SEEKER ? "Name" : "Company Name"}
            </Form.Label>
            <Form.Control
              id="name"
              type="name"
              placeholder={
                "Enter " + (userType === JOB_SEEKER ? "Name" : "Company Name")
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control id="email" type="email" placeholder="Enter email" />
            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control id="pw" type="password" placeholder="Password" />
          </Form.Group>

          <Button id="submit" variant="primary" type="submit">
            Next
          </Button>
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
  }

  return (
    <>
      <div className="page">
        <h1>JobLinked</h1>
        <h3>Where companies and people meet!</h3>
        <Form className="pageCard" id="signup-form" onSubmit={onSubmit}>
          <Form.Group className="mb-3" id="select">
            <Select
              fullWidth
              value={userType}
              onChange={handleChange}
              label="Age"
            >
              <MenuItem value={0}>Choose from below</MenuItem>
              <MenuItem value={JOB_SEEKER}>Job Hunter</MenuItem>
              <MenuItem value={EMPLOYER}>Employer</MenuItem>
            </Select>
          </Form.Group>
          {displayRemainingForm()}
        </Form>
      </div>
    </>
  );
}

export default Signup;
