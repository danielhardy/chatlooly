/*
 * REDIRECT TO ROOM ON FORM SUBMISSION
 */

function redirct2room() {
  var room = document.getElementById("room").value;

  //Redirect window using javascript
  window.location.href = "/r/" + room;
}
