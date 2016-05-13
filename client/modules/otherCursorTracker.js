//start tracking cursors
let startOtherCursorTracker = function() {
  //track cursors MongoDB
  let cursors = Cursors.find();
  let cursorHandle = cursors.observeChanges({
    added: function (id, fields) {
      if (Modules.client.getCursorId() == id) //if it's our cursor don't draw it
        return;

      let mouseCursor = document.createElement("div");
      mouseCursor.classList.add("cursorCircle");
      document.body.appendChild(mouseCursor);
      $(mouseCursor).css("background", fields.color);
      mouseCursor.id = id;
    },
    changed: function(id, fields) {
      if (Modules.client.getCursorId() !== id) //if it's not our cursor
        Modules.client.moveThing(document.getElementById(id),getHorizontalScaledLocation(fields.locationX), getVerticalScaledLocation(fields.locationY));
    },
    removed: function (id) {
      if (Modules.client.getCursorId() !== id) //if it's not our cursor
        $(document.getElementById(id)).remove();
    }
  });
};

let getHorizontalScaledLocation = function(locationX) {
  return locationX * Session.get('clientWidth');
}

let getVerticalScaledLocation = function(locationY) {
  return locationY * Session.get('clientHeight');
}


let moveCursorsResponsively = function() {
  let cursors = Cursors.find({cursorId: {$not: Modules.client.getCursorId()}}); //all ungrouped cards
  cursors.forEach(function(cursor) {

    console.log("moving cursor with id " + cursor._id + " to " + cursor.locationX*Session.get('clientWidth'), cursor.locationY + ", " + cursor.locationY*Session.get('clientHeight'));

    Modules.client.moveThing(document.getElementById(cursor._id),cursor.locationX*Session.get('clientWidth'), cursor.locationY*Session.get('clientHeight'));
  });
}

Modules.client.moveCursorsResponsively = moveCursorsResponsively;
Modules.client.startOtherCursorTracker = startOtherCursorTracker;
