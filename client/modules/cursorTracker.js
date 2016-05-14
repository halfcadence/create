let cursorId;
let defaultMouseX = -1;
let defaultMouseY = -1;

let startCursorTracker = () => {
  insertCursor(defaultMouseX,defaultMouseY);

  $(document).on('mousemove', function(e){ //track mouse position
    if (cursorId && Modules.client.getUserColor()) //if we have an user id and color
      Meteor.call("setCursorPosition", cursorId, Modules.client.getHorizontalPercentage(e.pageX), Modules.client.getVerticalPercentage(e.pageY), Modules.client.getProjectId(),Modules.client.getUserColor());
  });

  Modules.client.startOtherCursorTracker(); //track other mice
};

//insert mouse object in database
let insertCursor = function(mouseX, mouseY) {
  cursorId = Cursors.insert({
  projectId: Modules.client.getProjectId(),
  locationX: Modules.client.getHorizontalPercentage(mouseX),
  locationY: Modules.client.getVerticalPercentage(mouseY),
  color: Modules.client.getUserColor()
  });
}

let getCursorId = function() {
  return cursorId;
}

Modules.client.startCursorTracker = startCursorTracker;
Modules.client.getCursorId = getCursorId;
