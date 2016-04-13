//start tracking carets
let startOtherCaretTracker = () => {
  //track carets MongoDB
  let carets = Carets.find();
  let caretHandle = carets.observeChanges({
    added: function (id, fields) {
      if (Modules.client.getCaretId() == id) //if it's our caret don't draw it
        return;

      let arguments = {};
      arguments.color = fields.color;
      arguments.left = fields.locationX;
      arguments.top = fields.locationY;
      let caret = Modules.client.drawCaret(arguments);
      caret.id = id;
    },
    changed: function(id, fields) {
      if (Modules.client.getCaretId() == id) //if it's our caret
        return;

      moveThing(document.getElementById(id),fields.locationX, fields.locationY);
    },
    removed: function (id) {
      if (Modules.client.getCaretId() == id) //if it's our caret
        return;

      removeThing(document.getElementById(id));
    }
  });
};

let moveThing = function(thing,x,y){
  thing.style.top = y + 'px';
  thing.style.left = x + 'px';
};

let removeThing = function(thing){
   $(thing).remove();
};

Modules.client.startOtherCaretTracker = startOtherCaretTracker;
