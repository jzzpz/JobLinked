import React from "react";
import "../Styles/home.css";
import "../Styles/pages.css";
import "../Styles/card.css";
import not_found from "../Media/not_found.svg";

function NotFound() {
  return (
    <>
      <div className="page">
        <div className="pageCard">
          <img src={not_found} alt="working people"></img>
          <h1>Page not Found!</h1>
        </div>
      </div>
    </>
  );
}

export default NotFound;
