//start tracking cursors
let startOtherCursorTracker = () => {
  //track cursors MongoDB
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
      removeThing(document.getElementById(id));
    }
  });
};

let moveThing = function(thing,x,y){
  //if (!$(thing).queue().length){
   $(thing).animate({ top: y - 15, left: x - 15}, "fast", 'linear', {queue: false});
  //}
};

let removeThing = function(thing){
  //if (!$(thing).queue().length){
   $(thing).remove();
};
Modules.client.startOtherCursorTracker = startOtherCursorTracker;
