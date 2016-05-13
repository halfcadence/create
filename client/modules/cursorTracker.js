let cursorId;
let defaultMouseX = -1;
let defaultMouseY = -1;

let startCursorTracker = () => {
  insertCursor(defaultMouseX,defaultMouseY);

  $(document).on('mousemove', function(e){ //track mouse position
    if (cursorId)
      //set mouse position in database
      Meteor.call("setCursorPosition", cursorId, e.pageX, e.pageY, Modules.client.getProjectId(),Modules.client.getUserColor());
  });

  Modules.client.startOtherCursorTracker(); //track other mice
};

//insert mouse object in database
let insertCursor = function(mouseX, mouseY) {
  cursorId = Cursors.insert({
  projectId: Modules.client.getProjectId(),
  locationX: mouseX,
  locationY: mouseY,
  color: Modules.client.getUserColor()
  });
}

let getCursorId = function() {
  return cursorId;
}

Modules.client.startCursorTracker = startCursorTracker;
Modules.client.getCursorId = getCursorId;
