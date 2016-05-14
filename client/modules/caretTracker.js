Carets = new Mongo.Collection("carets");

let caret;
let caretId;

//track the user's cursor
let startCaretTracker = function () {
  if (caret) throw "trying to make caret, caret already exists";
  //insert caret to DB
  insertCaret(-1, -1);

  //interpret events on text boxes
  $(document).on('focus click keyup scroll', '.titleText, .bodyText, .bodyText2, .cost, .priority', function(){
    let coordinates = $(this).caret('position');
    let top = $(this).offset().top + coordinates.top;
    let left = $(this).offset().left + coordinates.left;
    moveCaret(top,left);
    $(this).css('border', 2*Session.get('scaleFactor') +'px solid ' + Modules.client.getUserColor()); //add border
  });
  Modules.client.startOtherCaretTracker();

  //remove border on blur
  $(document).on('blur', '.titleText, .bodyText, .bodyText2, .cost, .priority', function(){
    $(this).css('border', 'none');
  });
}

//draws a caret given pixel location
let drawCaret = function(args) {
  let arguments = args || {};
  let caret = document.createElement('div');
  document.body.appendChild(caret);
  caret.style.position = 'absolute';
  caret.style.background = arguments.color || 'black';
  caret.style.zIndex = 5000;
  caret.style.height = Session.get("scaleFactor")*50 + 'px';
  caret.style.width = Session.get("scaleFactor")*3 + 'px';
  caret.style.left = arguments.left + 'px' || '-1px';
  caret.style.top = arguments.top + 'px' || '-1px';
  return caret;
}

//sets a caret's database position
//arguments are pixel location
let moveCaret = function (top,left) {
  let scaledLeft = Modules.client.getHorizontalPercentage(left);
  let scaledTop = Modules.client.getVerticalPercentage(top);
  Meteor.call("setCaretPosition", caretId, scaledLeft, scaledTop, Modules.client.getProjectId(),Modules.client.getUserColor());
};

//inserts a caret into the database at location x, y
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
