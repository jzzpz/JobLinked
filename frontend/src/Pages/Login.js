import React from "react";
import { Form, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/home.css";
import "../Styles/pages.css";
import "../Styles/card.css";
import "../Styles/form.css";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import User from "../Apis/user";
import work_image from "../Media/work_image.svg";
import Stack from "@mui/material/Stack";
import { GoogleLogin } from "react-google-login";
import Dialog from "@mui/material/Dialog";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CountrySelect from "../Components/CountrySelect";
import { JOB_SEEKER, EMPLOYER } from "../Constants/user";

// lets us run login locally with a different google client id
const dev_mode = false;

function Login() {
  const [snackbarOpen, setsnackbarOpen] = React.useState(false);
  const [alert, setAlert] = React.useState("");
  const [openGoogleDialog, setOpenGoogleDialog] = React.useState(false);
  const [userType, setUserType] = React.useState(0);
  let [googleProfile, setGoogleProfile] = React.useState(null);

  let navigate = useNavigate();

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setsnackbarOpen(false);
  };

  let onSubmit = async (e) => {
    e.preventDefault();

    // Grab the password and email and login
    let pw = document.querySelector("#pw").value;
    let email = document.querySelector("#email").value;

    document.querySelector("#signin-form").reset();
    await User.login(email, pw).then(
      (id) => {
        // move to the profile page if successful
        navigate(`/profile/${id}`);
      },
      (err) => {
        setAlert(err.message);
        setsnackbarOpen(true);
      }
    );
  };

  const responseGoogle = async ({ profileObj }) => {
    // Check if the profile exists
    let profileExists = await User.checkProfileExists(profileObj.email);
    // If so log them in
    if (profileExists) {
      await User.login(profileObj.email, profileObj.googleId).then(
        (id) => {
          navigate(`/profile/${id}`);
        },
        (err) => {
          setAlert(err.message);
          setsnackbarOpen(true);
        }
      );
    } else {
      // If not ask for more info to finalize the profile
      const { email, googleId: pw, name } = profileObj;
      setGoogleProfile({ email, pw: pw.toString(), name });
      setOpenGoogleDialog(true);
    }
  };

  const validateSignUp = ({ pw, userType, name }) => {
    return (
      pw &&
      userType &&
      name &&
      pw.length >= 5 &&
      userType !== 0 &&
      name.length >= 2
    );
  };

  const googleError = () => {
    setAlert("Unable to sign in using Google");
    setsnackbarOpen(true);
  };

  // Close the google profile dialog
  const clearGoogleProfile = () => {
    setGoogleProfile(null);
    setOpenGoogleDialog(false);
  };

  // validate info on the google profile dialog
  const validateExtra = () => {
    let about = document.querySelector("#about").value;
    let location = document.querySelector("#country-select").value;
    return about.length > 5 && location.length > 0;
  };

  const handleGoogleRemainder = async (e) => {
    e.preventDefault();
    let valid = validateExtra();
    if (!valid) {
      setAlert("Form is not completed.");
      setsnackbarOpen(true);
    } else {
      const about = document.querySelector("#about").value;
      const location = document.querySelector("#country-select").value;

      // Signup the user first
      const userInfo = { ...googleProfile, userType };
      const validateUser = validateSignUp(userInfo);
      let userId = null;
      if (!validateUser) {
        setAlert("Form is not completed.");
        setsnackbarOpen(true);
      } else {
        await User.signUp(
          userInfo.name,
          userInfo.pw,
          userInfo.email,
          userInfo.userType
        )
          // log in to the account
          .then(() => {
            return User.login(userInfo.email, userInfo.pw);
          })
          // update the user info
          .then((id) => {
            userId = parseInt(id);
            return User.updateAbout(userId, userInfo.name, location, about);
          })
          // navigate to their profile
          .then(() => {
            setGoogleProfile(null);
            navigate(`/profile/${userId}`);
          })
          .catch((err) => {
            setAlert(err.message);
            setsnackbarOpen(true);
            setOpenGoogleDialog(false);
          });
      }
    }
  };
  // Set the user type select in state
  const handleChange = (event) => {
    setUserType(event.target.value);
  };

  return (
    <>
      <div className="page">
        <h1>JobLinked</h1>
        <h3>Where companies and people meet!</h3>
        <Stack className="pageCard" direction="row" spacing={2}>
          <img src={work_image} alt="working people" width="600"></img>
          <Form className="pageCard" id="signin-form" onSubmit={onSubmit}>
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
              Login
            </Button>
            <GoogleLogin
              clientId={
                !dev_mode
                  ? "407540579326-i11qs55fm93f65600tk2eno1ho9a0jrm.apps.googleusercontent.com"
                  : "407540579326-v20tioi6vpkooietrn53e424b8c8paib.apps.googleusercontent.com"
              }
              buttonText="Login"
              onSuccess={responseGoogle}
              onFailure={() => googleError()}
              cookiePolicy={"single_host_origin"}
            />
          </Form>
        </Stack>
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
        <Dialog
          id="googleDialog"
          open={openGoogleDialog}
          onClose={() => clearGoogleProfile()}
        >
          <Form
            className="pageCard"
            id="google-remainder-form"
            onSubmit={handleGoogleRemainder}
          >
            <Form.Group className="mb-3">
              <Form.Label>
                Looks like you are logging in using google for the first time.
                We need a little more info to make your profile
              </Form.Label>
              <Form.Group className="mb-3" id="select">
                <Form.Label>What Type of User are you?</Form.Label>
                <Select fullWidth value={userType} onChange={handleChange}>
                  <MenuItem value={0}>Choose from below</MenuItem>
                  <MenuItem value={JOB_SEEKER}>Job Hunter</MenuItem>
                  <MenuItem value={EMPLOYER}>Employer</MenuItem>
                </Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>About</Form.Label>
                <Form.Control id="about" as="textarea" rows={3} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <CountrySelect />
              </Form.Group>
            </Form.Group>
            <Button id="submit" variant="primary" type="submit">
              Finish Sign Up
            </Button>
          </Form>
        </Dialog>
      </div>
    </>
  );
}

export default Login;
