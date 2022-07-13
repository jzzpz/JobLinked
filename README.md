# JOB LINKED

## Project URL

[https://job-linked.me](https://job-linked.me/)

## Project Video URL 

<https://www.youtube.com/watch?v=Whv02_36rlM>

## Project Description

The application that we are creating will serve as a platform that will be used to facilitate the job-seeking process. It will contain two types of users (Job seeker and employer) and will allow these users to communicate and interact with each other in various ways. Employers will be able to post job postings where potential candidates are able to apply using their resumes and cover letters. Job-seekers are able to view a company’s profile and view ratings for the company made by other people to help guide them in the job searching process. In addition, job-seekers are able to create their own profiles as well to highlight important skills for potential employers to see. Employers are able to reach out to potential candidates via instant message to discuss information regarding employment. Our application’s purpose is to serve as an alternative to LinkedIn as both a social platform and a place for individuals to do their job searches.

## Development

The main framework that we used to write up the app was React. All of our components were written as functional components so a majority of the code is leveraging setState, useRef, and useEffect as the major lifecycle hook. We organized our front end code base to pages files and components, the pages corresponded to a component for each url path on our application while the components were reusable functional components scattered throughout the pages themselves. 

The backend framework that was used was ExpressJs. In our server.js we connect to graphql endpoints by routing any calls to ‘/graphql’ to our resolver. However, before we get into the resolver, we set a field called ‘signedIn’. This field is accessed in the qlresolver whenever an endpoint requires the user to be logged in before accessing it.

From a design standpoint, a majority of our ui and components come from Material UI. A common component used in almost all of our components is the snackbar and alert components from Material UI which we use to show error messages to users when running backend endpoints.

We used MYSQL as our backend database and leveraged gRPC as the middle man between our endpoint calls and the actual querying itself. The qlsolver file serves as our main security on the backend such that we use the Validator package and validate the content of our requests to the database. We ensure to escape all strings to save us from specific script attacks.

In terms of third-party libraries, the main ones used were *react-google-login, socket.io, simple-peer,* and *websocket*.* The *react-google-login* library was used to allow users to set up google login clients which in turn required us to make a google project through the google cloud platform (as suggested in: <https://www.youtube.com/watch?v=bf-vfhgWtKg>). Given a client id, the code will generate a dialog that can retrieve a google profile and we then parse our relevant data to create an account on our platform and store that in our MYSQL database.

*Websocket* was leveraged in creating our chat rooms. A socket was created upon entering and users were then allowed to communicate string messages through the socket. To ensure that users who are in different chat rooms do not receive a message from another chatroom, the message passed through the socket is actually a JSON object. This object includes key details about the message, namely the messenger, the message and the chatroom it belongs to. 

As a result, when a user receives this message it will parse the object and first ensure that this message is meant for the chatroom. If it is then the message is displayed to the user. The reason why this check is done in the front end is because chat rooms are not restricted to any user and anyone can join it. 

Finally, our last major feature, the “interviewing” feature, required our team to create our own implementation of the webRTC infrastructure. To do so, our team leveraged *socket.io* and *simple-peer*. Similar to the chatroom feature, a socket was created for an interviewee and interviewer to enter the room and notify one another of their presence. Once webcam and microphone media streams were taken, we would create a *simple-peer* to store the streams and signaling the SDP(Session Description Protocol) information from the peer through socket io to the other user in the same room, then streams will display on both users’ browsers. 

In terms of local development, we created an .env file in our backend to store our dev\_mode boolean to ensure that we can connect to our local MYSQL servers and our deployed server easily. We also have a boolean flag in frontend/src/pages/Login.js:22(<https://github.com/UTSCC09/project-webconquerors/blob/main/frontend/src/Pages/Login.js#L22>) to allow us to switch client ids for our google login client that gives permission to localhost versus the deployed app url when accessing the client. In addition, we also leverage express static to bridge our front and back end. We build our app into static files first to ensure that the compilation and usage of the code is quicker and more efficient since the built static files have been efficiently shortened and stored. 

## Deployment 

Our application was deployed using Digital Ocean. On Digital Ocean, a droplet (virtual machine) was created for us to host our application. We can connect to this virtual machine using PuTTy.

Within the virtual machine we installed the necessary packages needed to start up our application. First we had to clone the main branch into this virtual machine so that the codebase now resides in the file system. Within the git repository we then installed the packages necessary by running ‘npm install’ in the front and backend.

Next we used NGINX as a reverse proxy for our virtual machine by routing requests from our domain to our localhost in our virtual machine. 

We then used PM2 to run the server indefinitely so that I can exit the PuTTy terminal. The 

To retrieve our domain, we used name cheap and bought the domain ‘job-linked.me’. On Digital Ocean we then add a DNS and link it to the virtual machine and create a link to the droplet on name cheap as well. 

## Maintenance

We made it a priority to deploy our application early and after every merge into the main branch. Whenever a new feature is merged in, each member (who is responsible for certain features) will test the application to ensure that the application continues to function correctly.  We also periodically test our own features every few days to ensure that recent deployed changes have not broken previously merged features.
## Challenges

1. WebRTC :  Allowing users for real-time bidirectional event-based communication through socket io and direct peer to peer communication.

1. Learning the entire tech stack (React, gRPC, docker, MYSQL): As a group, we had a combined 0 experience in the tools as we had used different tech stacks for c01 and other courses. As a result, we spent an absurd amount of time struggling with react concepts like useState and understanding how to monitor changes in useEffect lifecycle hook. It took a while to gain an understanding of the asynchronous nature of the components in our code. Furthermore, setting up our gRPC endpoints took time as well as we hand wrote our schemas so we often ran into issues where our queries weren’t returning exactly what our schema had.

1. Dynamic Querying of Job Postings: The main problem with this feature was that it required us to dynamically query our job postings sql table as users input fields into the filter section of the job board. We had to leverage React.useState and useEffect to listen to filter changes and then create a dynamic query that represented these filter requests, grab the specific job\_postings and paginate those results on top of it. 

<!-- ## Contributions

### Zhi Ping Zhuang:

- Allow employer user type to create a job posting through job posting form
- Display job postings that can be deleted and more information can be shown inside a dialog
- Allow live interview between job seeker and employer through WebRTC.
- Connect React frontend code to backend code through server using the static folder in the frontend folder that is created from react build.


### Sendooran Sitsabesan:

- Allow job board which allows users to look at a paginated list of all the available jobs, dynamically filter them by either using the unique locations and position titles we pulled from our db, or giving keywords that we will look for in the key description. Also allow users to look a more detailed view of each job and apply to them with visual indicators that they applied and that they cannot apply again
- Allow users to login in using their own google accounts. I used *React-google-login* and added additional dialogs so that they can provide the essential fields necessary to make a profile on our platform. Subsequent logins on google will take you directly to your profile once you set it up the first time.
- Added the ability for employers to view all the applicants to their specific job posting, set up interviews with each individual one and delete them if necessary. Updated backend to update times if they try to schedule again.
- Did some of the validation work on the backend on inputs
- Added some small ux/ui improvements
  - Navbar changing depending on user type
  - Ensure all frontend endpoint calls catch errors 
  - Adding dev\_mode to .env and subsequent set up

### Antony Tang
- Created the initial React App codebase
- Established GraphQl set up so that endpoints can be created
- Created Signup form for users to signup as either a EMPLOYER or a JOB\_SEEKER
- Created a profile page to display key information about JOB\_SEEKER’s and EMPLOYER’s. Users are able to fill this information out when they signup and/or on their own profile. 
- Created NavBar to allow easy navigation for users
- Created authentication system to ensure endpoints are protected and secured so they can only be called when a user is signed in
- Created Chat Room to allow users to have real time communication with an employer using web sockets
- Created Reviews page to allow JOB\_SEEKER’s to leave reviews about their experience at the company
 -->


## One more thing? 

Regarding *React-Google-Login*, we noticed **when running locally** that we get a couple warnings on chrome regarding the cookie policy. This is not seen on our deployed application. It warns us to properly set the sameSite flag on our google requests and this is known to the developers (<https://github.com/anthonyjgrove/react-google-login/issues/261>). Given the widespread use of the tool and the fact that we don’t see it when deployed, we believe our requests are still secured.

If running locally, just set (<https://github.com/UTSCC09/project-webconquerors/blob/main/frontend/src/Pages/Login.js#L22>) and (<https://github.com/UTSCC09/project-webconquerors/blob/main/backend/.env#L5>) to true. Then run “npm run build” in the frontend, and “npm start” in the backend. This is assuming you have your local MySQL database set up to allow our application to connect (view <https://github.com/UTSCC09/project-webconquerors/blob/main/backend/db.js#L5>)

.


