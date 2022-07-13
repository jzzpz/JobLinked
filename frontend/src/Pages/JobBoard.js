import React, { useEffect, useRef } from "react";
import { Card } from "react-bootstrap";
import Button from "@mui/material/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/profile.css";
import "../Styles/icons.css";
import Job from "../Apis/job";
import User from "../Apis/user";
import EnhancedJobCard from "../Components/EnhancedJobCard";
import Autocomplete from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import JobApp from "../Apis/jobApp";

function JobBoard() {
  const [jobs, setJobs] = React.useState([]);
  const [initialJobStorage, setInitialJobStorage] = React.useState(false);
  const [locationOptions, setLocationOptions] = React.useState([]);
  const [positionOptions, setPositionOptions] = React.useState([]);
  const [myApps, setMyApps] = React.useState(null);
  const [lastPage, setLastPage] = React.useState(true);
  const [alert, setAlert] = React.useState("");
  const [snackbarOpen, setsnackbarOpen] = React.useState(false);

  const [filters, setFilters] = React.useState({
    title: { values: [], setAll: true },
    location: { values: [], setAll: false },
    key_description: { values: [], setAll: true },
    page: 0,
  });

  // used from https://usehooks.com/usePrevious/
  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    }, [value]);
    return ref.current;
  }

  const oldFilters = usePrevious(filters);
  const userId = parseInt(User.getId());

  useEffect(() => {
    let setInitialJobsFields = async () => {
      // get the unique position titles and locations from jobs on the db
      Job.getUniqueJobFields(["title", "location"])
        .then((uniqueJobFields) => {
          setLocationOptions(
            uniqueJobFields.filter((obj) => obj.key === "location")[0].values
          );
          setPositionOptions(
            uniqueJobFields.filter((obj) => obj.key === "title")[0].values
          );
          setInitialJobStorage(true);
        })
        .catch((err) => {
          setAlert(err.message);
          setsnackbarOpen(true);
        });
    };
    const setHaveIApplied = async (userId) => {
      // check if currnt user applied
      JobApp.didIApply(userId)
        .then((curApps) => {
          setMyApps(curApps);
        })
        .catch((err) => {
          setAlert(err.message);
          setsnackbarOpen(true);
        });
    };
    let setFilteredJobs = async () => {
      // filter jobs given user's filters
      Job.getFilteredJobs(filters)
        .then((filteredJobs) => {
          setJobs(filteredJobs.values);
          setLastPage(filteredJobs.lastPage);
        })
        .catch((err) => {
          setAlert(err.message);
          setsnackbarOpen(true);
        });
    };

    if (!initialJobStorage) {
      setInitialJobsFields();
    }
    // only update jobs if filters have changed
    if (oldFilters !== filters && !isNaN(userId)) {
      setFilteredJobs();
      setHaveIApplied(userId);
    }

    if (myApps === null && !isNaN(userId)) {
      setHaveIApplied(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, jobs, initialJobStorage]);

  function createJobList() {
    return (
      <Card className="pageCard">
        <Card.Body>
          <h3>Job List</h3>
          <div className="JobList">
            {jobs &&
              jobs.map((job) => {
                const haveApplied = myApps
                  ? myApps.some((app) => app === job.id)
                  : false;
                return (
                  <EnhancedJobCard
                    userId={userId}
                    haveApplied={haveApplied}
                    authorId={job.author_id}
                    jobId={job.id}
                    posTitle={job.title}
                    company={job.company}
                    deadline={job.deadline}
                    location={job.location}
                    experience={job.key_description}
                    longDescription={job.description}
                    qualifications={job.qualification}
                  />
                );
              })}
          </div>
          <Button
            disabled={filters.page === 0}
            variant="outlined"
            onClick={() => {
              pageUpdate(false);
            }}
          >
            {" "}
            Prev{" "}
          </Button>
          <Button
            disabled={lastPage}
            variant="outlined"
            onClick={() => {
              pageUpdate(true);
            }}
          >
            {" "}
            Next{" "}
          </Button>
        </Card.Body>
      </Card>
    );
  }
  const pageUpdate = (next) => {
    const newFilter = filters;
    if (next) {
      newFilter.page++;
    } else {
      newFilter.page--;
    }
    setFilters({ ...newFilter });
  };

  const handleFormChange = (filterName) => {
    return (e, value) => {
      const newFilter = filters;
      newFilter[filterName].values = value;
      setFilters({ ...newFilter });
    };
  };

  const createAutoComplete = (args) => {
    const { labelName, options, filterName, needAll } = args;
    if (filters[filterName] === undefined) {
      const newFilter = filters;
      newFilter[filterName] = { values: [], needAll };
      setFilters(newFilter);
    }
    return (
      <>
        <FormControl fullWidth>
          <Autocomplete
            multiple
            freeSolo
            options={options}
            onChange={handleFormChange(filterName)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} variant="filled" label={labelName} />
            )}
          />
        </FormControl>
      </>
    );
  };
  return (
    <>
      {!isNaN(userId) ? (
        <div className="page">
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
          <Card className="pageCard">
            <Card.Body>
              <h3>
                <strong>Filters</strong>
              </h3>
              <form>
                {createAutoComplete({
                  labelName: "Keyword Search",
                  options: [],
                  filterName: "key_description",
                  needAll: true,
                })}
                {locationOptions
                  ? createAutoComplete({
                      labelName: "Location",
                      options: locationOptions,
                      filterName: "location",
                      needAll: false,
                    })
                  : null}
                {positionOptions
                  ? createAutoComplete({
                      labelName: "Position",
                      options: positionOptions,
                      filterName: "title",
                      needAll: false,
                    })
                  : null}
              </form>
            </Card.Body>
          </Card>
          {createJobList()}
        </div>
      ) : (
        <CircularProgress />
      )}
    </>
  );
}

export default JobBoard;
