//get the secrete room name (passed in from backend);
var secrete_room = window.location.href.substring(
  window.location.href.lastIndexOf("/") + 1
);

//Colors for usernames;
var user_colors = {};
var HOST = location.origin.replace(/^http/, "ws");

//open the connection
var socket = io.connect(HOST);

//Capture a username;
//var this_user = prompt("What's your name?");

// on connection to server, ask for user's name with an anonymous callback
socket.on("connect", function() {
  // call the server-side function 'adduser' and send one parameter (value of prompt)
  socket.emit("adduser", this_user);
});

// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on("updatechat", function(username, data, room) {
  var message_background = "";

  //Determine if user has a color if not make one;
  if (!user_colors.hasOwnProperty(username)) {
    //This is client side only so it is not managed by a user;
    user_colors[username] =
      "#" + Math.floor(Math.random() * 16777215).toString(16) + "44";
  }

  //Set the background for this user
  message_background = user_colors[username];

  //Determine if this was from you or someone else
  var message_class = "them";
  if (this_user === username) {
    message_class = "you";
  } else if (username === "Chit Chatter[server]") {
    message_class = "server";
    message_background = "none";
  }
  if (message_class === "them") {
    //If it this isn't a server response send a notification
    notifyMe({
      username: username,
      message: data,
      title: "New Message from " + username,
      icon: "/img/icons/android/hdpi.png",
      room: room
    });
  }

  //Put the message on the page;
  $("#messages").append(
    '<li class="message ' +
      message_class +
      '" style="background-color: ' +
      message_background +
      ';"><span class="message_username">' +
      username +
      ':</span><div class="message_content">' +
      data +
      "</div></li>"
  );

  //Scroll to bottom;
  $(".message-container")
    .stop()
    .animate({ scrollTop: $(".message-container")[0].scrollHeight }, 800);
});

// listener, whenever the server emits 'updaterooms', this updates the room the client is in
socket.on("updaterooms", function(rooms, current_room) {
  //Check to see if we have a secrete room;
  if (secrete_room !== "") {
    //Looks like there is so add it to the list;
    rooms.push(secrete_room);

    //remove room list and just set to secrete;
    rooms = [];
    current_room = secrete_room;
  }

  $("#rooms").empty();
  $.each(rooms, function(key, value) {
    if (value == current_room) {
      $("#rooms").append("<div>" + value + "</div>");
    } else {
      $("#rooms").append(
        '<div><a href="#" onclick="switchRoom(\'' +
          value +
          "')\">" +
          value +
          "</a></div>"
      );
    }
  });
});

function switchRoom(room) {
  socket.emit("switchRoom", room);
}

// on load of page
$(function() {
  if (secrete_room !== "") {
    switchRoom(secrete_room);
  }

  // when the client clicks SEND
  $("#message-send").click(function() {
    //Get the messages;
    var message = $("#new-message").val();

    //Clear the message;
    $("#new-message").val("");

    //Place the focus back on the field;
    $("#new-message").focus();

    // tell server to execute 'sendchat' and send along one parameter
    socket.emit("sendchat", message);
  });

  // when the client hits ENTER on their keyboard
  $("#new-message").keypress(function(e) {
    if (e.which == 13) {
      $(this).blur();
      $("#message-send")
        .focus()
        .click();
    }
  });
});
