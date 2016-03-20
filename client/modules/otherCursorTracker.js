let startOtherCursorTracker = () => {
  let cursors = Cursors.find();
  let cursorHandle = cursors.observeChanges({
  added: function (id, fields) {
    let mouseCursor = document.createElement("div");
    mouseCursor.classList.add("cursorCircle");
    document.body.appendChild(mouseCursor);
    mouseCursor.id = id;
  },
  changed: function(id, fields) {
    moveThing(document.getElementById(id),fields.locationX, fields.locationY);
  },
  removed: function (id) {
    console.log("removed a cursor");
  }
});
};

var moveThing = function(thing,x,y){
  console.log("moving thing to " + y + ", " + x);
  //if (!$(thing).queue().length){
   $(thing).animate({ top: y - 50, left: x - 50}, "fast", 'linear', {queue: false});
  //}
};

Modules.client.startOtherCursorTracker = startOtherCursorTracker;
