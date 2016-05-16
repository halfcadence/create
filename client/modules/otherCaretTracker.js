//start tracking carets
let startOtherCaretTracker = () => {
  //track carets MongoDB
  let carets = Carets.find();
  //we observe everything rather than just the changes so that we can recalculate the entire position as needed
  let caretHandle = carets.observeChanges({
    added: function (id, fields) {
      if (Modules.client.getCaretId() == id) //if it's our caret don't draw it
        return;

      let arguments = {};
      arguments.color = fields.color;
      arguments.left = Modules.client.getHorizontalScaledLocation(fields.elementX) + Session.get('scaleFactor')*fields.locationX;
      arguments.top = Modules.client.getVerticalScaledLocation(fields.elementY) + Session.get('scaleFactor')*fields.locationY;
      let caret = Modules.client.drawCaret(arguments);
      caret.id = id;
    },
    removed: function (id) {
      if (Modules.client.getCaretId() == id) //if it's our caret
        return;

        $(document.getElementById(id)).remove();
    }
  });

  let changedCaretHandle = carets.observe({
    changed: function(caret) {
      if (Modules.client.getCaretId() !== caret._id) {//if it's not our caret
        console.log('handle read locations ' + caret.locationX + ", " + caret.locationY + ", " + caret.elementX + ", " + caret.elementY);
        moveCaret(document.getElementById(caret._id),caret.locationX,caret.locationY,caret.elementX, caret.elementY);
      }
    },
  });
};

//moves a caret to a certain location, interpreting the element location
let moveCaret = function(caret, x, y, elementX, elementY) {
  console.log('move command goes to ' + Session.get('scaleFactor')*x + ", " + Session.get('scaleFactor')*y + ", " + Modules.client.getHorizontalScaledLocation(elementX) + ", " + Modules.client.getVerticalScaledLocation(elementY) );
  let left = Modules.client.getHorizontalScaledLocation(elementX) + Session.get('scaleFactor')*x;
  let top = Modules.client.getVerticalScaledLocation(elementY) + Session.get('scaleFactor')*y;

  Modules.client.moveThing(caret,left, top);
}

let moveCaretsResponsively = function() {
  let carets = Carets.find(); //all carets
  carets.forEach(function(caret) {
    moveCaret(document.getElementById(caret._id),caret.locationX,caret.locationY,caret.elementX, caret.elementY);
  });
}

Modules.client.moveCaretsResponsively = moveCaretsResponsively;
Modules.client.moveCaret = moveCaret;
Modules.client.startOtherCaretTracker = startOtherCaretTracker;
