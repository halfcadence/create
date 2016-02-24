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

$(window).resize(function(){
    window.resizeTo($(window).innerWidth,$(window).innerHeight);
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
    drawNoteCard(card._id,card.locationX,card.locationY,card.title, card.body, card.body2, card.position); //draw all the cards
  });
});

UI.body.events({ //events on the page body
  "click button.blue": function (event) { //click on new button
    event.preventDefault(); // Prevent default browser form submit
    makeNewNoteCard(undefined,undefined,"", "", "", "left"); //make a new empty notecard
  }
  /*
  "click": function (event) {
    console.log("click on document body")
    if (!$(event.target).closest('.pep').length) //if the target was not a pep
    disableCurrentEnabled();
  }*/
});


//temp solution since i can't get it to work with meteor
$(document).on('click', function(event) {
  console.log("click on document body")
  if (!$(event.target).closest('.pep').length) //if the target was not a pep
    disableCurrentEnabled();
});

/*--------------
  card functions
  --------------*/

var makeNewNoteCard = function(locationX,locationY,title,body, body2, position) {
  var locationX = typeof locationX !== 'undefined' ? locationX   : 195;
  var locationY = typeof locationY !== 'undefined' ? locationY   : 25;
  var title = typeof title !== 'undefined' ? title   : "";
  var body = typeof body !== 'undefined' ? body   : "";
  var body2 = typeof body2 !== 'undefined' ? body2   : "";
  var position = typeof position !== 'undefined' ? position   : "left";

  var cardId = Cards.insert({
        title: title,
        body: body,
        body2: body2,
        locationX:  locationX,
        locationY: locationY,
        position: position
  });
  drawNoteCard(cardId,locationX,locationY,title,body, body2, position);
}

var drawNoteCard = function(cardId, locationX, locationY, title, body, body2, position) {
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
  if (body !== 'undefined')
    $(noteCard).find(".bodyText").val(body); //set body if argument given
  if (body2 !== 'undefined')
    $(noteCard).find(".bodyText2").val(body2); //set body2 if argument given
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
      var position = $(noteCard).position();
      console.log("position: " + position.left + ", " + position.top)
      var delposition = $('button.red').position()
      bottom =  delposition.left - position.left;
      right = delposition.top - position.top;

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
        } else { //click in body which is disabled
          setCurrentEnabled($(noteCard).find(".bodyText2"));
          focusOn($(noteCard).find(".bodyText2"));
        }
      }
    })
  })
}

Template.notecard.onCreated(function() {
  this.titleText = new ReactiveVar("");
  this.bodyText = new ReactiveVar("");
  this.bodyText2 = new ReactiveVar("");

});

Template.notecard.events({
  'input .titleText, change .titleText, keyup .titleText, mouseup .titleText': function (event,template) {
    // Prevent default browser form submit
    event.preventDefault();

    //Get value from form element
    //var text = event.target.titleText.value;
    var text = event.target.value;
    // Insert a task into the collection
    template.titleText.set(text); //set reactive var to new value
    //somehow store in database
    Cards.update(template.data.id, { //set position in database
        $set: {title: text}
      });
  },
  'input .bodyText, change .bodyText, keyup .bodyText, mouseup .bodyText': function (event,template) {
    // Prevent default browser form submit
    event.preventDefault();

    //Get value from form element
    //var text = event.target.titleText.value;
    var text = event.target.value;
    // Insert a task into the collection
    template.bodyText.set(text); //set reactive var to new value
    //somehow store in database
    Cards.update(template.data.id, { //set position in database
        $set: {body: text}
      });
  },
  'input .bodyText2, change .bodyText2, keyup .bodyText2, mouseup .bodyText2': function (event,template) {
    // Prevent default browser form submit
    event.preventDefault();

    //Get value from form element
    //var text = event.target.titleText.value;
    var text = event.target.value;
    // Insert a task into the collection
    template.bodyText2.set(text); //set reactive var to new value
    //somehow store in database
    Cards.update(template.data.id, { //set position in database
        $set: {body2: text}
      });
  }
});

var goToTop = function(notecard) {
    $(notecard).css('z-index', ++maxZIndex);
}
var slide = function(notecard, direction) {
  if (direction === "left") {
    $(notecard).find(".bodyText2").css('left', 0);
    notecard.position = "right"; //right element showing
    Cards.update(notecard.id, { //set position in database
        $set: {position: "right"}
      });

  } else if (direction === "right") {
    $(notecard).find(".bodyText2").css('left', 500);
    this.position = "left"; //left element showing
    Cards.update(notecard.id, { //set position in database
        $set: {position: "left"}
      });
  }
}

var focusDescriptionAndEnableLeftTriangle = function(notecard) {
  focusOn($(notecard).find(".bodyText"));
  enable($(notecard).find(".leftTriangle"));
  enabledTriangle = $(notecard).find(".leftTriangle");
}
var focusImplementationAndEnableRightTriangle =  function(notecard) {
  focusOn($(notecard).find(".bodyText2"));
  enable($(notecard).find(".rightTriangle"));
  enabledTriangle = $(notecard).find(".rightTriangle");
}

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
      //if (!$(currentEnabled).hasClass('bodyText || bodyText2')) {
        //disable(enabledTriangle)
      //}
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