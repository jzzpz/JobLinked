const path = require("path");
const express = require("express");
const app = express();
const WebSocket = require("ws");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const fs = require("fs");
const cors = require("cors");
const validator = require("validator");
const qlSchema = buildSchema(fs.readFileSync(path.join(__dirname, "/api.gql")).toString());

const qlResolver = require("./qlresolver");
const bodyParser = require("body-parser");
const cookie = require("cookie");
const session = require("express-session");
const morgan = require("morgan");
require("dotenv").config();
const dev_mode = process.env.dev_mode === "true";

app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));
require("dotenv").config();

const buildPath = path.normalize(path.join(__dirname, "../frontend/build"));
app.use(express.static(buildPath));

app.use(
  session({
    secret: "please change this secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      ...(!dev_mode && { secure: true }),
      samesite: "strict",
    },
  })
);
app.use((req, res, next) => {
  let cookies = cookie.parse(req.headers.cookie || "");
  req.signedIn = cookies.userid ? true : false;
  if (!req.signedIn) {
    res.cookie("userid", "", {
      maxAge: 0,
      httpOnly: false,
      ...(!dev_mode && { secure: true }),
      samesite: "strict",
    });
  }
  next();
});
app.use("/graphql", (req, res) => {
  graphqlHTTP({
    schema: qlSchema,
    rootValue: qlResolver, // root handler function
    graphiql: true,
    context: { req, res },
  })(req, res);
});

app.get("/*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"), function (err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

app.get("/", (req, res, next) => {
  var cookies = cookie.parse(req.headers.cookie || "");
  req.username = cookies.username ? cookies.username : null;
  console.log("HTTP request", req.username, req.method, req.url, req.body);
  next();
});

const http = require("http");
const PORT = 3000;
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

server.listen(process.env.PORT || PORT, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost");
});

/**
 * socket.io and ws servers on the same port code is from //https://gir.me.uk/posts/socket.io-and-ws-server-on-the-same-port.html
 */

const wss = new WebSocket.Server({ noServer: true });

const ioHandleUpgrade = server._events.upgrade;
delete server._events.upgrade;

server.on("upgrade", function (req, socket, head) {
  if (req.url.indexOf("socket.io") > -1) {
    ioHandleUpgrade(req, socket, head);
  } else {
    wss.handleUpgrade(req, socket, head, (webSocket) => {
      wss.emit("connection", webSocket, req);
    });
  }
});

/**
 * Some of the WebRTC code are from https://github.com/adrianhajdin/project_video_chat
 * And https://github.com/coding-with-chaim/group-video-final/blob/master/server.js
 */

let users = {};

let socketToRoom = {};

io.on("connection", (socket) => {
  socket.on("joinRoom", (roomID) => {
    socket.join(roomID);
    // if someone is already in the room
    if (users[roomID]) {
      const length = users[roomID].length;
      if (length === 2) {
        socket.emit("roomFull");
        return;
      }
      users[roomID].push(socket.id);
    } else {
      // create a room and add my socket id to the room
      users[roomID] = [socket.id];
    }
    socketToRoom[socket.id] = roomID;
    socket.to(roomID).emit("inRoom", socket.id);
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });
  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
  socket.on("disconnect", () => {
    const roomID = socketToRoom[socket.id];
    let socIdInRoom = users[roomID];
    if (socIdInRoom) {
      socIdInRoom = socIdInRoom.filter((id) => id !== socket.id);
      users[roomID] = socIdInRoom;
    }
    socket.to(roomID).emit("callEnded");
    socket.leave(roomID);
  });
});

/**
 * Web socket code from https://github.com/Vuka951/tutorial-code/blob/master/js-express-websockets/done/index.js
 */
wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(newMessage) {
    let message = newMessage.toString();
    let valid = validator.escape(message);
    if (valid) {
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
    // }
  });
});
