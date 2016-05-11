Carets = new Mongo.Collection("carets");

let caret;
let caretId;

//track the user's cursor
let startCaretTracker = function () {
  if (caret) throw "trying to make caret, caret already exists";
  //insert caret to DB
  insertCaret(-1000, -1000);

  //interpret events on text boxes
  $(document).on('focus click keyup scroll', '.titleText, .bodyText, .bodyText2, .cost, .priority', function(){
    let coordinates = $(this).caret('position');
    let top = $(this).offset().top + coordinates.top;
    let left = $(this).offset().left + coordinates.left;
    moveCaret(top,left);
    $(this).css('border', '2px solid ' + Modules.client.getUserColor()); //add border
  });
  Modules.client.startOtherCaretTracker();

  //remove border on blur
  $(document).on('blur', '.titleText, .bodyText, .bodyText2, .cost, .priority', function(){
    $(this).css('border', 'none');
  });
}

let drawCaret = function(args) {
  let arguments = args || {};
  let caret = document.createElement('div');
  document.body.appendChild(caret);
  caret.style.position = 'absolute';
  caret.style.background = arguments.color || 'black';
  caret.style.zIndex = 5000;
  caret.style.height = Session.get("scaleFactor")*50 + 'px';
  caret.style.width = Session.get("scaleFactor")*3 + 'px';
  caret.style.top = arguments.top + 'px'|| '-1000px';
  caret.style.left = arguments.left + 'px' || '-1000px';
  return caret;
}

//make that bootiful caret move its bootiful booty
let moveCaret = function (top,left) {
  Meteor.call("setCaretPosition", caretId, left, top, Modules.client.getProjectId(),Modules.client.getUserColor());
};

let insertCaret = function(x, y) {
  caretId = Carets.insert({
  projectId: Modules.client.getProjectId(),
  locationX: x,
  locationY: y,
  updatedAt: Date.now(),
  color: Modules.client.getUserColor()
  });
}

let getCaretId = function() {
  return caretId;
}

Modules.client.drawCaret = drawCaret;
Modules.client.startCaretTracker = startCaretTracker;
Modules.client.moveCaret = moveCaret;
Modules.client.getCaretId = getCaretId;
