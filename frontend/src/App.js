import "./App.css";
import Profile from "./Pages/Profile";
import NavBar from "./Components/NavigationBar";
import JobBoard from "./Pages/JobBoard";
import Signup from "./Pages/Signup";
import JobPosting from "./Pages/JobPosting";
import JobPostingForm from "./Pages/JobPostingForm";
import AdditionalInfo from "./Pages/AdditionalInfo";
import Login from "./Pages/Login";
import Interviews from "./Pages/Interviews";
import MyInterviews from "./Pages/MyInterviews";
import ChatRoom from "./Pages/ChatRoom";
import NotFound from "./Pages/NotFound";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path="/" element={<Signup />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/complete-profile" element={<AdditionalInfo />}></Route>
          <Route path="/profile/:id" element={<Profile />}></Route>
          <Route path="/jobboard" element={<JobBoard />}></Route>
          <Route path="/job-posting" element={<JobPosting />} />
          <Route
            path="/job-posting/job-posting-form"
            element={<JobPostingForm />}
          />
          <Route
            path="/interview/:interviewid"
            element={<Interviews />}
          ></Route>
          <Route path="/my-interviews" element={<MyInterviews />}></Route>
          <Route path="/chatroom/:id" element={<ChatRoom />}></Route>
          <Route path="/not-found" element={<NotFound />}></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
