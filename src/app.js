var express = require("express"),
  app = express(),
  http = require("http"),
  server = http.createServer(app),
  sassMiddleware = require("node-sass-middleware"),
  path = require("path"),
  io = require("socket.io").listen(server),
  Logger = require("le_node");

// setup Log Entries
var log = new Logger({
  token: "5c4fe351-5c5d-4ee5-83bb-1767800c952b"
});

// configure port/host info
var port = process.env.PORT || 8080;
//var host = process.env.HOSTNAME || "localhost";

// start the server
server.listen(port);

// configure express;
app.set("view engine", "pug");
app.use(express.static("public"));

// setup a middleware for compiling SCSS;
app.use(
  sassMiddleware({
    src: path.join(__dirname, "src"),
    dest: path.join(__dirname, "public"),
    debug: true,
    force: true,
    outputStyle: "compress"
  })
);

// routing
app.get("/", function(req, res) {
  //res.send('No room identified... Please try a room specific URL. '+req.params['room_name']);
  res.render("index");
});

app.get("/r/:roomname", function(req, res) {
  res.render("chatterbox", {
    secrete_room: req.params.roomname,
    port: port
  });
});

// Privacy & TOS
app.get("/privacy", function(req, res) {
  res.render("privacy_policy");
});
app.get("/tos", function(req, res) {
  res.render("tos");
});

// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = ["room1", "room2", "room3"];

io.sockets.on("connection", function(socket) {
  // when the client emits 'adduser', this listens and executes
  socket.on("adduser", function(username, room) {
    // store the username in the socket session for this client
    socket.username = username;

    // store the room name in the socket session for this client
    socket.room = room;

    // add the client's username to the global list
    usernames[username] = username;

    // send client to room 1
    socket.join(room);

    // echo to room that a person has connected to their room
    socket.broadcast
      .to(room)
      .emit(
        "updatechat",
        "Chit Chatter[server]",
        username +
          " has connected to this room (" +
          Object.keys(usernames).length +
          " total users)."
      );

    // log the connection
    log.log("debug", { username: username, room: room, type: "connect" });
  });

  // when the client emits 'sendchat', this listens and executes
  socket.on("sendchat", function(data) {
    // we tell the client to execute 'updatechat' with 2 parameters
    io.sockets.in(socket.room).emit("updatechat", socket.username, data);
  });

  socket.on("switchRoom", function(newroom) {
    socket.leave(socket.room);
    socket.join(newroom);
    socket.emit(
      "updatechat",
      "Chit Chatter[server]",
      "you have connected to " +
        newroom +
        " (" +
        Object.keys(usernames).length +
        " total users)"
    );

    // sent message to OLD room
    socket.broadcast
      .to(socket.room)
      .emit(
        "updatechat",
        "Chit Chatter[server]",
        socket.username +
          " has left this room (" +
          Object.keys(usernames).length +
          " total users)"
      );

    // update socket session room title
    socket.room = newroom;
    socket.broadcast
      .to(newroom)
      .emit(
        "updatechat",
        "Chit Chatter[server]",
        socket.username +
          " has joined this room (" +
          Object.keys(usernames).length +
          " total users)"
      );
    socket.emit("updaterooms", rooms, newroom);
  });

  // when the user disconnects.. perform this
  socket.on("disconnect", function() {
    // remove the username from global usernames list
    delete usernames[socket.username];

    // update list of users in chat, client-side
    io.sockets.emit("updateusers", usernames);

    // echo globally that this client has left
    socket.broadcast.emit(
      "updatechat",
      "Chit Chatter[server]",
      socket.username +
        " has disconnected (" +
        Object.keys(usernames).length +
        " total users)"
    );
    socket.leave(socket.room);

    // log the disconnection
    log.log("debug", { username: socket.username, type: "disconnect" });
  });
});
