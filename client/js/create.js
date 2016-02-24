Cards = new Mongo.Collection("cards");

Meteor.startup(function () {
  currentFocus = null //the textarea focus on
  currentEnabled = null
  enabledTriangle = null
  Session.set("document_loaded", true);
});

Meteor.subscribe('Cards', function(){ //runs when Cards is finished publishing
   //Set the reactive session as true to indicate that the data have been loaded
   Session.set('cards_loaded', true); 
});

Tracker.autorun(function(c){
  var cardsLoaded = Session.get('cards_loaded');
  var documentLoaded = Session.get('document_loaded');
  if(!(cardsLoaded && documentLoaded 
    && typeof Cards !== 'undefined'
    && typeof document.body !== 'undefined'))
    return;
  c.stop();
  console.log("loading previous cards")
  var cards = Cards.find().fetch();
  cards.forEach(function (card) {
    drawNoteCard(card._id,card.locationX,card.locationY);
  });
});

Template.body.events({ //events on the page body
  "click button.blue": function (event) { //click on new button
    event.preventDefault(); // Prevent default browser form submit
    //var noteCard = new Notecard(); //make new notecard
    makeNewNoteCard();
  }
});

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
  var locationX = typeof locationX !== 'undefined' ? locationX   : 25;
  var locationY = typeof locationY !== 'undefined' ? locationY   : 25;
  var renderedNoteCard = document.createElement("div");
  document.body.appendChild(renderedNoteCard);
  UI.renderWithData(Template.notecard,"hi",renderedNoteCard);
  var noteCard = document.body.lastChild;
  $(noteCard).pep({ //add pep to notecard
    constrainTo: 'window',
    elementsWithInteraction: 'textarea',
    //detects mouseUp
    startPos: {
      left: locationX,
      top: locationY
    },
    stop: (function(ev) {
      var position = $(noteCard).position();
      console.log("position of notecard is now " + position.left + ", " + position.top)
      Cards.update(cardId, {
        $set: {locationX: position.left,
               locationY: position.top}
      });
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