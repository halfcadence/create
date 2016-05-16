Carets = new Mongo.Collection("carets");

let caret;
let caretId;

//track the user's cursor
let startCaretTracker = function () {
  if (caret) throw "trying to make caret, caret already exists";
  //insert caret to DB
  insertCaret(0,0,-1, -1);

  //interpret events on text boxes
  $(document).on('focus click keyup scroll', '.titleText, .bodyText, .bodyText2, .cost, .priority', function(){
    //position of caret inside element
    let left = $(this).caret('position').left;
    let top = $(this).caret('position').top;

    //position of element
    let elementLeft = $(this).offset().left;
    let elementTop = $(this).offset().top;

    moveCaret(left,top, elementLeft, elementTop);
    console.log('on text box event: moving caret to ' + left + ", " + top + ", " + elementLeft + ", " + elementTop);
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
//@top, @left location of the caret in the element
//@elementTop, @elementLeft location of the element in the document
let moveCaret = function (left,top, elementLeft, elementTop) {
  let scaledLeft = left/Session.get('scaleFactor');
  let scaledElementLeft = Modules.client.getHorizontalPercentage(elementLeft);
  let scaledTop = top/Session.get('scaleFactor');
  let scaledElementTop = Modules.client.getVerticalPercentage(elementTop);
  console.log('scaled position to ' + scaledLeft + ", " + scaledTop + ", " + scaledElementLeft + ", " + scaledElementTop);
  Meteor.call("setCaretPosition", caretId, scaledLeft, scaledTop, scaledElementLeft, scaledElementTop, Modules.client.getProjectId(),Modules.client.getUserColor());
};

//inserts a caret into the database
//@x, @y location of the caret in the elementTop
//@elementX, @elementY location of the element in the document
let insertCaret = function(x, y, elementX, elementY) {
  caretId = Carets.insert({
  projectId: Modules.client.getProjectId(),
  locationX: x,
  locationY: y,
  elementX: elementX,
  elementY: elementY,
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
