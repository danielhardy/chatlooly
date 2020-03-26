//get the secrete room name (passed in from backend);
// on connection to server, ask for user's name with an anonymous callback
socket.on("connect", function() {
  // call the server-side function 'adduser' and send one parameter (value of prompt)
  socket.emit("adduser", prompt("What's your name?"));
});

// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on("updatechat", function(username, data) {
  //console.log("Message receieved!");

  //Determine if user has a color if not make one;
  if (!user_colors.hasOwnProperty(username)) {
    //This is client side only so it is not managed by a user;
    user_colors[username] =
      "#" + Math.floor(Math.random() * 16777215).toString(16);
  }
  //Create the message
  $("#messages").append(
    '<li><b style="color: ' +
      user_colors[username] +
      '">' +
      username +
      ":</b> " +
      data +
      "</li>"
  );

  //Send notifications
  console.log("The room you are in is " + rooms[0]);

  //Notify
  notifyMe({
    username: username,
    message: data,
    title: "New Message",
    room: rooms[0]
  });
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
  // when the client clicks SEND
  $("#message-send").click(function() {
    var message = $("#new-message").val();
    console.log("sent new message");

    $("#new-message").val("");
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

// Add notifications
// request permission on page load
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM Loaded Event Fired!");
  if (!Notification) {
    alert("Desktop notifications not available in your browser. Try Chromium.");
    return;
  }

  if (Notification.permission !== "granted") Notification.requestPermission();
});

function notifyMe(message) {
  if (Notification.permission !== "granted") Notification.requestPermission();
  else {
    var notification = new Notification("Notification title", {
      icon: "http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png",
      body: message.data
    });
    notification.onclick = function() {
      window.open("http://chat.ellooley.com/r/" + message.room);
    };
  }
}
