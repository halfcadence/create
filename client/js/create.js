/*-----------------
  startup functions
  -----------------*/
//forces application to wait for startup to run loading code
finishedLoading = false;

Cards = new Mongo.Collection("cards");

Router.route('/', {
    template: 'home'
});

Router.route('/:_id', function () {
  this.render('application');
  projectId = this.params._id;
  Session.set('filter', {"projectId": projectId});
  Tracker.autorun(function() {
    Meteor.subscribe('Cards', Session.get('filter'), function(){
      Session.set('cards_loaded', true);
    });
  Session.set("routed", true);
  });
});

Meteor.startup(function () { //the document is loaded
  currentFocus = null //the textarea currently focused
  currentEnabled = null //the currently enabled textarea
  enabledTriangle = null //the currently enabled triangle

  //workaround for not being able to find current notecard
  //from inside pep events
  LastEnabledNotecard = null
  maxZIndex = 0
  Session.set("document_loaded", true);
});

$(window).resize(function(){
    window.resizeTo($(window).innerWidth,$(window).innerHeight);
});

Tracker.autorun(function(c){ //check whether the document and database are loaded
  var cardsLoaded = Session.get('cards_loaded');
  var documentLoaded = Session.get('document_loaded');
  var routed = Session.get('routed');
  console.log("cards loaded: " + cardsLoaded + ", documents loaded: " + documentLoaded + "routed: + " + routed);
  //explicit callbacks to loaded
  var finishedLoading = cardsLoaded && documentLoaded && routed;
  //sanity check to make sure things are properly loaded
  var loadingChecks = typeof Cards !== 'undefined' && typeof document.body !== 'undefined' && typeof projectId !== 'undefined';
  if(!(finishedLoading && loadingChecks))
    return;
  //both are loaded
  c.stop(); //stop the tracker
  var cards = Cards.find().fetch();
  cards.forEach(function (card) {
    drawNoteCard(card._id,card.locationX,card.locationY,card.title, card.body, card.body2, card.cost, card.priority, card.position); //draw all the cards
  });
});

Template.application.events({ //events on the page body
  "click button.blue": function (event) { //click on new button
    event.preventDefault(); // Prevent default browser form submit
    makeNewNoteCard(undefined,undefined,"", "", "", "", "", "left"); //make a new empty notecard
  }
});


//temp solution since i can't get it to work with meteor
$(document).on('click', function(event) {
  if (!$(event.target).closest('.pep').length) //if the target was not a pep
    disableCurrentEnabled();
});

/*--------------
  card functions
  --------------*/

var makeNewNoteCard = function(locationX,locationY,title,body,body2,cost, priority, position) {
  var locationX = typeof locationX !== 'undefined' ? locationX   : 195;
  var locationY = typeof locationY !== 'undefined' ? locationY   : 25;
  var title = typeof title !== 'undefined' ? title   : "";
  var body = typeof body !== 'undefined' ? body   : "";
  var body2 = typeof body2 !== 'undefined' ? body2   : "";
  var position = typeof position !== 'undefined' ? position : "left";
  var cost = typeof cost !== 'undefined' ? cost : "0";
  var priority = typeof priority !== 'undefined' ? priority : "0";

  var cardId = Cards.insert({
        projectId: projectId,
        title: title,
        body: body,
        body2: body2,
        locationX:  locationX,
        locationY: locationY,
        cost: cost,
        priority: priority,
        position: position
  });
  drawNoteCard(cardId,locationX,locationY,title,body, body2, cost, priority, position);
}

var drawNoteCard = function(cardId, locationX, locationY, title, body, body2, cost, priority, position) {
  //set defaults for location variables
  var locationX = typeof locationX !== 'undefined' ? locationX   : 195;
  var locationY = typeof locationY !== 'undefined' ? locationY   : 25;
  var position = typeof position !== 'undefined' ? position : "left";
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
  if (cost !== 'undefined')
    $(noteCard).find(".cost").val(cost); //set cost if argument given
  if (priority !== 'undefined')
    $(noteCard).find(".priority").val(priority); //set priority if argument given
  noteCard.id = cardId; //hold id for updates
  noteCard.position = position;
  $(noteCard).pep({ //add pep to notecard
    constrainTo: 'window',
    elementsWithInteraction: 'textarea',
    startPos: {
      left: locationX,
      top: locationY
    },
    initiate: function() {
      goToTop(noteCard);
    },
    rest: (function(ev) {
      //here we don't catch the possible null reference because it's just a waste of time
      if (!noteCard)
        return;
      Cards.update(cardId, { //set position in database
        $set: {locationX: $(noteCard).position().left,
               locationY: $(noteCard).position().top}
      });
    }),
    stop: (function(ev) {
      var position = $(noteCard).position();
      var delposition = $('button.red').position()
      bottom =  delposition.left - position.left;
      right = delposition.top - position.top;
      if (bottom <= 350 && right <= 25) {
        Cards.remove({_id : noteCard.id})
        $(noteCard).remove();
        noteCard = null;
        return;
      }
      //if mouseup when drag has not started
      if (!this.started) {
        point = FindLocationOnObject(ev);
        if (point.y <= 100) { //clicked title
          setCurrentEnabled($(noteCard).find(".titleText"))
          focusOn($(noteCard).find(".titleText"))
        } //leftTriangle clicked when body is not focused
        else if (point.y >= 200 && point.x >= 400) {
          //slide left
          slide(noteCard,"left");
        } //rightTriangle clicked when body is not focused
        else if (point.y >= 200 && point.x <= 100) {
          slide(noteCard, "right");
        } else { //click in body which is disabled
          LastEnabledNotecard = noteCard;
          if (noteCard.position === "left") { //client view
            setCurrentEnabled($(noteCard).find(".bodyText"));
            focusDescriptionAndEnableLeftTriangle(noteCard);
          } else { //developer view
            setCurrentEnabled($(noteCard).find(".bodyText2"));
            focusImplementationAndEnableRightTriangle(noteCard);
          }
        }
      }
    })
  })
}

Template.notecard.onCreated(function() {
  this.titleText = new ReactiveVar("");
  this.bodyText = new ReactiveVar("");
  this.bodyText2 = new ReactiveVar("");
  this.cost = new ReactiveVar("");
  this.priority = new ReactiveVar("");
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
  },
  'input .cost, change .cost, keyup .cost, mouseup .cost': function (event,template) {
    // Prevent default browser form submit
    event.preventDefault();

    //Get value from form element
    //var text = event.target.titleText.value;
    var text = event.target.value;
    // Insert a task into the collection
    template.cost.set(text); //set reactive var to new value
    //somehow store in database
    Cards.update(template.data.id, { //set position in database
        $set: {cost: text}
      });
  },
  'input .priority, change .priority, keyup .priority, mouseup .priority': function (event,template) {
    // Prevent default browser form submit
    event.preventDefault();

    //Get value from form element
    //var text = event.target.titleText.value;
    var text = event.target.value;
    // Insert a task into the collection
    template.priority.set(text); //set reactive var to new value
    //somehow store in database
    Cards.update(template.data.id, { //set position in database
        $set: {priority: text}
      });
  },
  'click .leftTriangle': function (event,template) {
    // Prevent default browser form submit
    event.preventDefault();
    slide(LastEnabledNotecard,"left")
    //enable and focus implementation
    setCurrentEnabled($(LastEnabledNotecard).find(".bodyText2"))
    focusImplementationAndEnableRightTriangle(LastEnabledNotecard);
  },
  'click .rightTriangle': function (event,template) {
    // Prevent default browser form submit
    event.preventDefault();
    slide(LastEnabledNotecard,"right")
    //enable and focus implementation
    setCurrentEnabled($(LastEnabledNotecard).find(".bodyText"))
    focusDescriptionAndEnableLeftTriangle(LastEnabledNotecard);
  }
  //click buttons are broken bc they want reference to notecard as well
  //click left right will go here eventually:
  /*
  $(noteCard.leftTriangle).on('click', function() {
    noteCard.slide("left")
    //enable and focus implementation
    setCurrentEnabled(noteCard.implementation);
    noteCard.focusImplementationAndEnableRightTriangle();
  });

  $(noteCard.rightTriangle).on('click', function() {
    noteCard.slide("right")
      //enable and focus implementation
    setCurrentEnabled(noteCard.description);
    noteCard.focusDescriptionAndEnableLeftTriangle();
  });
  */
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
    notecard.position = "left"; //left element showing
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
}
var disable = function(object) {
  $(object).css('pointer-events', 'none');
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
