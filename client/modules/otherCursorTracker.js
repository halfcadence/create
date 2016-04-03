//start tracking cursors
let startOtherCursorTracker = () => {
  //track cursors MongoDB
  let cursors = Cursors.find();
  let cursorHandle = cursors.observeChanges({
    added: function (id, fields) {
      //if (Modules.client.getCursorId() == id) //if it's our cursor don't draw it
      //  return;

      let mouseCursor = document.createElement("div");
      mouseCursor.classList.add("cursorCircle");
      document.body.appendChild(mouseCursor);
      mouseCursor.id = id;
    },
    changed: function(id, fields) {
      //if (Modules.client.getCursorId() == id) //if it's our cursor
      //  return;

      moveThing(document.getElementById(id),fields.locationX, fields.locationY);
    },
    removed: function (id) {
      //if (Modules.client.getCursorId() == id) //if it's our cursor
      //  return;

      removeThing(document.getElementById(id));
    }
  });
};

let moveThing = function(thing,x,y){
  $(thing).animate({ top: y - 15, left: x - 15}, "fast", 'linear', {queue: false});
};

let removeThing = function(thing){
   $(thing).remove();
};

Modules.client.startOtherCursorTracker = startOtherCursorTracker;
