let cursorId;
let moved = false;
let startCursorTracker = () => {
  let mouseX = 0;
  let mouseY = 0;
  let time = new Date;
  let cursorId;
  //periodically update time
  setInterval(function () {
    Meteor.call("getServerTime", function (error, result) {
        time = result;
    });
  }, 200);
  cursorId = Cursors.insert({
    locationX: mouseX,
    locationY: mouseY,
    time: time
  });
  //track mouse position
  $(document).on('mousemove', function(e){
        mouseX = e.pageX;
        mouseY = e.pageY;
        moved = true;
  });
  //update mouse position on interval
  setInterval(function() {setPosition(cursorId, mouseX,mouseY, time);}, 200);
  Modules.client.startOtherCursorTracker();
};

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

Modules.client.startCursorTracker = startCursorTracker;
