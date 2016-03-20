let cursorId;

let startCursorTracker = () => {
  let mouseX = 0;
  let mouseY = 0;
  cursorId = Cursors.insert({
      locationX: mouseX,
      locationY: mouseY
  });
  //track mouse position
  $(document).on('mousemove', function(e){
        mouseX = e.pageX;
        mouseY = e.pageY;
  });
  //update mouse position on interval
  setInterval(function() {setPosition(mouseX,mouseY);}, 200);
  Modules.client.startOtherCursorTracker();
};

let setPosition = function(x,y){
  console.log("mouseXY are " + x + ", " + y);
  Cursors.update(cursorId, { //set position in database
      $set: {locationX: x,
             locationY: y}
    });
};

Modules.client.startCursorTracker = startCursorTracker;
