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
    drawNoteCard(card._id,card.locationX,card.locationY,card.title); //draw all the cards
  });
});

Template.body.events({ //events on the page body
  "click button.blue": function (event) { //click on new button
    event.preventDefault(); // Prevent default browser form submit
    makeNewNoteCard(undefined,undefined,""); //make a new empty notecard
  }
});

/*--------------
  card functions
  --------------*/

var makeNewNoteCard = function(locationX,locationY,title) {
  var locationX = typeof locationX !== 'undefined' ? locationX   : 195;
  var locationY = typeof locationY !== 'undefined' ? locationY   : 25;
  var title = typeof title !== 'undefined' ? title   : "";

  var cardId = Cards.insert({
        title: title,// current time
        locationX:  locationX,
        locationY: locationY
  });
  drawNoteCard(cardId,locationX,locationY,title);
}

var drawNoteCard = function(cardId, locationX, locationY, title) {
  //set defaults for location variables
  var locationX = typeof locationX !== 'undefined' ? locationX   : 195;
  var locationY = typeof locationY !== 'undefined' ? locationY   : 25;

  var noteCard = document.createElement("div"); //make a noteCard (it's just a div now)
  document.body.appendChild(noteCard); //add the div to the document
  UI.renderWithData(Template.notecard,{id : cardId},noteCard); //add notecard template
  // note: i'm putting the id in the template as well as the outer div 
  // because i don't know how to get the id from inside the template's events

  if (title !== 'undefined')
    $(noteCard).find(".titleText").val(title); //set title if argument given
  noteCard.id = cardId; //hold id for updates
  console.log(noteCard.id)
  console.log("notecard's pep: " + $(noteCard).find('.pep'))
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
      var position = $(noteCard).position();
      console.log("position: " + position.left + ", " + position.top)
      var delposition = $('button.red').position()
      bottom =  delposition.left - position.left;
      right = delposition.top - position.top;
            console.log("distance from button red: " + bottom + ", " + right)

      if (bottom <= 350 && right <= 25) {
        Cards.remove({_id : noteCard.id})
        $(noteCard).remove();
        noteCard = null;
      }
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
  this.titleText = new ReactiveVar("");
});

Template.notecard.events({
  'input .titleText, change .titleText, keyup .titleText, mouseup .titleText': function (event,template) {
    // Prevent default browser form submit
    event.preventDefault();

    //Get value from form element
    //var text = event.target.titleText.value;
    var text = event.target.value;
    console.log("text in title box: " + text);
    // Insert a task into the collection
    template.titleText.set(text); //set reactive var to new value
    //somehow store in database
    Cards.update(template.data.id, { //set position in database
        $set: {title: text}
      });
  }
});


/*----------------
  helper functions
  ----------------*/

Template.registerHelper('instance', function() {
  return Template.instance();
});
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