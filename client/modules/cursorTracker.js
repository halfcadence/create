let cursorId;
let moved = false;
let startCursorTracker = () => {
  let mouseX = -100;
  let mouseY = -100;

  insertCursor(mouseX,mouseY);

  setInterval(function () { //update position on interval
    setPosition(cursorId, mouseX,mouseY);
  }, 200);

  $(document).on('mousemove', function(e){ //track mouse position
    mouseX = e.pageX;
    mouseY = e.pageY;
    moved = true;
  });

  Modules.client.startOtherCursorTracker(); //track other mice
};

let insertCursor = function(mouseX, mouseY) {
  cursorId = Cursors.insert({
  projectId: Modules.client.getProjectId(),
  locationX: mouseX,
  locationY: mouseY,
  });
}

let setPosition = function(cursorId, x, y){
  if (!moved || !cursorId) return; //if cursor hasn't moved or cursorid hasn't been set
  Meteor.call("setCursorPosition", cursorId, x, y, Modules.client.getProjectId());
  moved = false;
};

let _getCursorId = function() {
  return cursorId;
}

Modules.client.startCursorTracker = startCursorTracker;
Modules.client.getCursorId = _getCursorId;
