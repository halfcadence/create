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
      arguments.left = Modules.client.getHorizontalScaledLocation(fields.locationX);
      arguments.top = Modules.client.getVerticalScaledLocation(fields.locationY);
      let caret = Modules.client.drawCaret(arguments);
      caret.id = id;
    },
    changed: function(id, fields) {
      if (Modules.client.getCaretId() !== id) //if it's not our caret
        Modules.client.moveThing(document.getElementById(id),Modules.client.getHorizontalScaledLocation(fields.locationX), Modules.client.getVerticalScaledLocation(fields.locationY));
    },
    removed: function (id) {
      if (Modules.client.getCaretId() == id) //if it's our caret
        return;

        $(document.getElementById(id)).remove();
    }
  });
};

Modules.client.startOtherCaretTracker = startOtherCaretTracker;
