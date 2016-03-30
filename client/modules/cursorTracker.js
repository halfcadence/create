let cursorId;
let moved = false;
let startCursorTracker = () => {
  let mouseX = 0;
  let mouseY = 0;
  let time = new ReactiveVar(new Date);

  Tracker.autorun(function(c) {
    insertCursor(mouseX,mouseY,time.get());
    c.stop();
  });

  //periodically update time
  setInterval(function () {
    Meteor.call("getServerTime", function (error, result) {
        time.set(result);
    });
  }, 200);
  //track mouse position
  $(document).on('mousemove', function(e){
        mouseX = e.pageX;
        mouseY = e.pageY;
        moved = true;
  });
  //update mouse position on interval
  Tracker.autorun(function(c) {
    setPosition(cursorId, mouseX,mouseY, time.get());
  });
  //setInterval(setPosition(cursorId, mouseX,mouseY, time.get()), 200);

  //track other mice
  Modules.client.startOtherCursorTracker();
};

let insertCursor = function(mouseX, mouseY, time) {
    cursorId = Cursors.insert({
    locationX: mouseX,
    locationY: mouseY,
    time: time
  });
}
let setPosition = function(i, x, y, t){
  if (!moved) return;
  Cursors.upsert(i, { //set position in database and time last updated
    $set: {
      locationX: x,
      locationY: y,
      time: t}
    });
  moved = false;
};

let _getCursorId = function() {
  return cursorId;
}
Modules.client.startCursorTracker = startCursorTracker;
Modules.client.getCursorId = _getCursorId;
