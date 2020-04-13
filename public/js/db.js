// This file contains the data managment;
var db = new PouchDB("chatlooly");
var remoteCouch = false;
var fullUser = {};
var this_user = "";

//Determine if there is a user
function getUser(callback, error) {
  db.get("user")
    .then(function(doc) {
      //Should have a user here;
      //console.log(`User found: ${JSON.stringify(doc)}`);

      //Update the global so we can access later;
      fullUser = doc;
      //Call the call back;
      callback(doc);
      spreadUser(doc);
    })
    .catch(function(err) {
      //Should not have a user data so make some;
      createUser(prompt("What is your name?"));
    });
}

//Create a user
function createUser(name, callback) {
  //console.log("Attempting to create a new user: " + name);
  this_user = name;
  db.put({
    _id: "user",
    name: name
  })
    .then(function(response) {
      // Read the full doc as the response doesn't contain the name
      db.get("user").then(function(doc) {
        //console.log("Just finished creating user: " + JSON.stringify(doc));
        spreadUser(doc);
      });
    })
    .catch(function(err) {
      //failed to create user;
      //callback(err);
      console.log(`Error: ${JSON.stringify(err)}`);
    });
}
//Propagate the user name to the UI by making all classes `username` innhtml the new username
function spreadUser(doc) {
  console.log("Spread was called with " + JSON.stringify(doc));
  this_user = doc.name;
  var el = document.getElementsByClassName("username");
  for (i = 0; i < el.length; i++) {
    el[i].innerHTML = doc.name;
  }
}

//Delete user
function deleteUser() {
  //TODO remove all databases;
}

//Fetch rooms
function getRooms(callback) {
  console.log("Looking for rooms...");
  db.get("rooms")
    .then(function(doc) {
      //Should have a user here;
      console.log(`Rooms found: ${JSON.stringify(doc)}`);

      //Update the global so we can access later;
      Rooms = doc;
      //Call the call back;
      callback(doc);
    })
    .catch(function(err) {
      //Should not have a user data so make some;
      console.log("No Rooms found");
    });
}

//Add Room to DB
function createRooms(room) {
  var room_data = {
    _id: new Date().toISOString(),
    room: room
  };
  db.put(room_data, function callback(err, result) {
    if (!err) {
      console.log("Successfully added a room!");
    }
  });
}

//Get list of rooms
function readRooms() {
  db.allDocs({ include_docs: true, descending: true }, function(err, doc) {
    updateRoomList(doc.rows);
  });
}

function updateRoomList(docs) {
  for (const doc in docs) {
    console.log(JSON.stringify(doc));
  }
}