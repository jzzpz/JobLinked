import * as React from "react";
import { useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import Link from "@mui/material/Link";
import { JOB_SEEKER, EMPLOYER } from "../../Constants/user";
import User from "../../Apis/user";

/**
 * Code has been modified from "App Bar with a primary search field".
 * Can be found at https://mui.com/components/app-bar/
 *
 */

export default function NavBar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [user, setUser] = React.useState(undefined);

  const isMenuOpen = Boolean(anchorEl);

  let navigate = useNavigate();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const logout = () => {
    User.logout().then(
      (result) => {
        if (result) {
          userId = User.getId();
          navigate(`/login`);
        }
      },
      (err) => {
        console.log(err);
      }
    );
    handleMenuClose();
  };

  let userId = User.getId();
  const updateProfile = async () => {
    if (userId.length > 0 && !user) {
      User.profile(parseInt(userId)).then(
        (pfile) => {
          setUser(pfile);
        },
        (err) => {
          console.log(err);
        }
      );
    }
  };

  const profileMenuItems = () => {
    if (user && userId) {
      if (user.user_type === JOB_SEEKER) {
        return (
          <div>
            <MenuItem
              onClick={() => {
                navigate(`/profile/${userId.toString()}`);
                handleMenuClose();
              }}
            >
              Profile
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate(`/my-interviews`);
                handleMenuClose();
              }}
            >
              My Interviews
            </MenuItem>
            <MenuItem onClick={logout}>Sign-Out</MenuItem>
          </div>
        );
      } else if (user.user_type === EMPLOYER) {
        return (
          <div>
            <MenuItem
              onClick={() => {
                navigate(`/profile/${userId.toString()}`);
                handleMenuClose();
              }}
            >
              Profile
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate(`/job-posting`);
                handleMenuClose();
              }}
            >
              My Job Postings
            </MenuItem>
            <MenuItem onClick={logout}>Sign-Out</MenuItem>
          </div>
        );
      }
    } else {
      if (user) setUser(undefined);
      return (
        <MenuItem
          onClick={() => {
            navigate(`/login`);
            handleMenuClose();
          }}
        >
          Signin
        </MenuItem>
      );
    }
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      {profileMenuItems()}
    </Menu>
  );

  useEffect(() => {
    function callback() {
      updateProfile();
    }
    callback();
  });
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar style={{ background: "#262626" }} position="static">
        <Toolbar>
          <Link
            component="button"
            underline="none"
            color="inherit"
            onClick={() => {
              navigate(`/`);
            }}
          >
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              JobLinked
            </Typography>
          </Link>
          {user && user.user_type === "JOB_SEEKER" ? (
            <Link
              component="button"
              underline="none"
              color="inherit"
              onClick={() => {
                navigate(`/jobboard`);
              }}
              style={{ margin: "10px" }}
            >
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                Job Board
              </Typography>
            </Link>
          ) : (
            <></>
          )}

          {user && user.user_type === "EMPLOYER" ? (
            <Link
              component="button"
              underline="none"
              color="inherit"
              onClick={() => {
                navigate(`/job-posting`);
              }}
              style={{ margin: "10px" }}
            >
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ display: { xs: "none", sm: "block", margin: "10px" } }}
              >
                Job Postings
              </Typography>
            </Link>
          ) : (
            <></>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMenu}
    </Box>
  );
}
