/*-----------------
  startup functions
  -----------------*/

Cards = new Mongo.Collection("cards");

Meteor.startup(function () { //the document is loaded
  currentFocus = null //the textarea currently focused
  currentEnabled = null //the currently enabled textarea
  enabledTriangle = null //the currently enabled triangle
  Session.set("document_loaded", true);
});

Meteor.subscribe('Cards', function(){ //runs when Cards is finished publishing
   Session.set('cards_loaded', true); 
});

Tracker.autorun(function(c){ //check whether the document and database are loaded
  var cardsLoaded = Session.get('cards_loaded');
  var documentLoaded = Session.get('document_loaded');
  if(!(cardsLoaded && documentLoaded 
    && typeof Cards !== 'undefined'
    && typeof document.body !== 'undefined'))
    return;
  //both are loaded
  c.stop(); //stop the tracker
  console.log("loading previous cards")
  var cards = Cards.find().fetch();
  cards.forEach(function (card) {
    drawNoteCard(card._id,card.locationX,card.locationY); //draw all the cards
  });
});

Template.body.events({ //events on the page body
  "click button.blue": function (event) { //click on new button
    event.preventDefault(); // Prevent default browser form submit
    //var noteCard = new Notecard(); //make new notecard
    makeNewNoteCard();
  }
});

/*--------------
  card functions
  --------------*/

var makeNewNoteCard = function(locationX,locationY) {
  var cardId = Cards.insert({
        title: "title",// current time
        locationX:  195,
        locationY: 25
  });
  console.log("id of the card: " + cardId);
  drawNoteCard(cardId,locationX,locationY);
}

var drawNoteCard = function(cardId, locationX, locationY) {
  //set defaults for location variables
  var locationX = typeof locationX !== 'undefined' ? locationX   : 25;
  var locationY = typeof locationY !== 'undefined' ? locationY   : 25;

  var noteCard = document.createElement("div"); //make a noteCard (it's just a div now)
  document.body.appendChild(noteCard); //add the div to the document
  UI.renderWithData(Template.notecard,"hi",noteCard); //add notecard template
  noteCard.id = cardId; //hold id for updates
  $(noteCard).pep({ //add pep to notecard
    constrainTo: 'window',
    elementsWithInteraction: 'textarea',
    startPos: {
      left: locationX,
      top: locationY
    },
    rest: (function(ev) {
      Cards.update(cardId, { //set position in database
        $set: {locationX: $(noteCard).position().left,
               locationY: $(noteCard).position().top}
      });
    }),
    stop: (function(ev) {
      //if mouseup when drag has not started
      if (!this.started) {
        point = FindLocationOnObject(ev);
        if (point.y <= 100) { //clicked title
          setCurrentEnabled($(noteCard).find(".titleText"))
          focusOn($(noteCard).find(".titleText"))
        }
      }
    })
  })
}

Template.notecard.onCreated(function() {
  console.log("created notecard")
  this.titleText = new ReactiveVar("what");
});

Template.registerHelper('instance', function() {
  return Template.instance();
});

/*----------------
  helper functions
  ----------------*/

var setCurrentEnabled = function(object) {
    disableCurrentEnabled()
    currentEnabled = object;
    enable(object);
  }
  //enables and disables pointer-events
var enable = function(object) {
  $(object).css('pointer-events', 'auto');
  //$(object).css('background-color', 'red');
}
var disable = function(object) {
  $(object).css('pointer-events', 'none');
  //$(object).css('background-color', 'yellow');
}
var focusOn = function(newFocus) {
    newFocus.focus();
    currentFocus = newFocus;
  }
var unFocus = function() {
  if (currentFocus !== null) {
    currentFocus.blur();
    currentFocus = null;
  }
}
var disableCurrentEnabled = function() {
    if (currentEnabled != null) {
      if (!$(currentEnabled).hasClass('bodyText || bodyText2')) {
        disable(enabledTriangle)
      }
      disable(currentEnabled)
      currentEnabled = null
    }
  }
  //finds the location of a click event on an object
var FindLocationOnObject = function(ev) {
  var $div = $(ev.target);
  var $display = $div.find('.display');
  var offset = $div.offset();
  var x = ev.clientX - offset.left;
  var y = ev.clientY - offset.top;

  return {
    x,
    y
  };
}