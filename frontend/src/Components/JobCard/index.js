import React from "react";
import { Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const JobCard = (props) => {
  let experience = props.experience.includes('[') && props.experience.includes(']') ? JSON.parse(props.experience) : props.experience; 
  return (
    <Card className="jobCard">
      <Card.Body>
        <Card.Title>{props.posTitle}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          <strong>{props.company}</strong> {"- " + props.location}
        </Card.Subtitle>
        <Card.Subtitle className="mb-2"> {
          Array.isArray(experience) ? <ul> {experience.map(exp => <li>{exp}</li>)}</ul> : experience}
        </Card.Subtitle>
      </Card.Body>
    </Card>
  );
};

export default JobCard;
