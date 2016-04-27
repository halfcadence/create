let currentFocus = null //the textarea focused on
let currentEnabled = null
let enabledTriangle = null
let cardWidth = 500;
let cardHeight = 300;

//new button
Template.application.events({ //events on the page body
  "click button.blue": function (event) { //click on new button
    event.preventDefault(); // Prevent default browser form submit
    Meteor.call("getNextZIndex", Modules.client.getProjectId(), function(error, result) {
      makeNewNoteCard(result);
    });
  }
});

let makeNewNoteCard = function(zIndex) {
  var id = Cards.insert({
        projectId: Modules.client.getProjectId(),
        title: "",
        body: "",
        body2: "",
        locationX:  195,
        locationY: 25,
        cost: "",
        priority: "",
        position: "left",
        groupId: "",
        zIndex: zIndex
  });
}

let drawNoteCard = function(id, args){
  let arguments = args || {};
  let noteCard = new Notecard();
  noteCard.id = id;
  //set div's id to same as notecard's so notecardTracker can find it
  noteCard.div.id = id;

  //add argument fields
  $(noteCard.input).val(arguments.title || "");
  $(noteCard.description).val(arguments.body || "");
  $(noteCard.implementation).val(arguments.body2 || "");
  $(noteCard.cost).val(arguments.cost || "");
  $(noteCard.priority).val(arguments.priority || "");

  //set z-index
  $(noteCard.div).css('z-index', arguments.zIndex || 100);

  //set position
  if (arguments.position === "right")
    noteCard.slide("left");

  //add functions to update database
  noteCard.input.oninput = function() {
    Cards.update(id, {
      $set: {title : $(noteCard.input).val()}
    });
  };
  noteCard.description.oninput = function() {
    Cards.update(id, {
      $set: {body : $(noteCard.description).val()}
    });
  };
  noteCard.implementation.oninput = function() {
    Cards.update(id, {
      $set: {body2 : $(noteCard.implementation).val()}
    });
  };
  noteCard.cost.oninput = function() {
    Cards.update(id, {
      $set: {cost : $(noteCard.cost).val()}
    });
  };
  noteCard.priority.oninput = function() {
    Cards.update(id, {
      $set: {priority : $(noteCard.priority).val()}
    });
  };

  //left triangle clicked when body focused
  $(noteCard.leftTriangle).on('click', function() {
    noteCard.slide("left")
    //enable and focus implementation
    setCurrentEnabled(noteCard.implementation);
    noteCard.focusImplementationAndEnableRightTriangle();
  });
  //right triangle clicked when body focused
  $(noteCard.rightTriangle).on('click', function() {
    noteCard.slide("right")
      //enable and focus implementation
    setCurrentEnabled(noteCard.description);
    noteCard.focusDescriptionAndEnableLeftTriangle();
  });
  $(noteCard.div).pep({
    cssEaseDuration: 750, //amount of time betwen stop and rest
    constrainTo: 'window',
    elementsWithInteraction: 'textarea',
    //detects mouseUp
    startPos: {
      left: arguments.locationX || 195,
      top: arguments.locationY || 25
    },
    startThreshold: [25, 25],
    initiate: function() {
      noteCard.goToTop();
      Cards.update(id, { //set position in database...TODO: optimize this a bit with an interval
        $set: {locationX: $(noteCard.div).position().left,
               locationY: $(noteCard.div).position().top}
      });
    },
    drag: function(ev, obj){
      Cards.update(id, { //set position in database...TODO: optimize this a bit with an interval
        $set: {locationX: $(noteCard.div).position().left,
               locationY: $(noteCard.div).position().top}
      });
      Modules.client.moveCaret(-100,-100); //kill the caret... eventually we need to figure out which text box it's in and move, etc...
    },
    rest: (function(ev) {
      if (!noteCard)
        return;

      //second half of rest bug workaround
      if (noteCard.grouped) {
        noteCard.grouped = false; //reset grouped so that resting works in the future
        return; // prevent position from being set while trying to fly to x=1000 for group
      }
      Cards.update(id, { //set position in database
        $set: {locationX: $(noteCard.div).position().left,
              locationY: $(noteCard.div).position().top,
              groupId: ""} //if we rest and haven't been put into a group, take us out of group
      });
    }),
    stop: (function(ev) {
      //if mouseup when drag has not started
      if (!this.started) {
        point = FindLocationOnObject(ev);
        if (point.y <= 100) { //clicked title
          setCurrentEnabled(noteCard.input);
          focusOn(noteCard.input);
        }
        //leftTriangle clicked when body is not focused
        else if (point.y >= 200 && point.x >= 400) {
          //slide left
          noteCard.slide("left");
        }
        //rightTriangle clicked when body is not focused
        else if (point.y >= 200 && point.x <= 100) {
          noteCard.slide("right");
        } else { //click in body which is disabled
          if (noteCard.position === "left") { //client view
            setCurrentEnabled(noteCard.description);
            noteCard.focusDescriptionAndEnableLeftTriangle();
          } else { //developer view
            setCurrentEnabled(noteCard.implementation);
            noteCard.focusImplementationAndEnableRightTriangle();
          }
        }
      }

      let link = $(noteCard.div);
      let position = link.position(); //cache the position
      let right = $(window).width() - position.left - link.width();
      let bottom = $(window).height() - position.top - link.height();
      if (bottom <=50 && right <= 50) {
        // delete the card
        // Cards.remove({_id : noteCard.id});
        addToGroup(noteCard.id, "trash");
        noteCard.grouped = true; //workaround for rest bug
      }
      else if (bottom <=50 && position.left <= 50) { //left corner group
        addToGroup(noteCard.id, "leftCornerGroup");
        noteCard.grouped = true;
      }
      else if (position.top <=50 && right <= 50) { //right corner group
        addToGroup(noteCard.id, "rightCornerGroup");
        noteCard.grouped = true;
      }
      else if (bottom <=50 //we really need a real collision engine T.T
        && position.left >= $(window).width()/2 - 300 //left corner is past middle - 300px
        && position.left + 500 <= $(window).width()/2 + 300 ) { //right corner is before middle + 300px
        addToGroup(noteCard.id, "bottomMiddleGroup");
        noteCard.grouped = true;
      }
      else if (position.top <=50 //we really need a real collision engine T.T
        && position.left >= $(window).width()/2 - 300 //left corner is past middle - 300px
        && position.left + 500 <= $(window).width()/2 + 300 ) { //right corner is before middle + 300px
        addToGroup(noteCard.id, "topMiddleGroup");
        noteCard.grouped = true;
      }
    })
  });
}

//notecard object, without pep
let Notecard = function() {
  this.position = "left";
  //make a white box, add pep to it
  this.div = document.createElement("div");
  this.div.classList.add("pep");
  document.body.appendChild(this.div);

  //add title
  this.input = document.createElement('textarea');
  $(this.input).attr('spellcheck', false);
  this.input.classList.add("titleText");
  $(this.div).append(this.input);
  //add description
  this.description = document.createElement('textarea');
  $(this.description).attr('spellcheck', false);
  this.description.classList.add("bodyText");
  $(this.div).append(this.description);

  //add implementation details
  this.implementation = document.createElement('textarea');
  $(this.implementation).attr('spellcheck', false);
  this.implementation.classList.add("bodyText2");
  $(this.div).append(this.implementation);
  //somehow left triangle is the one on the right
  this.leftTriangle = document.createElement('button');
  this.leftTriangle.classList.add("leftTriangle");
  $(this.div).append(this.leftTriangle);
  //and right triangle is the one on the left
  this.rightTriangle = document.createElement('button');
  this.rightTriangle.classList.add("rightTriangle");
  $(this.div).append(this.rightTriangle);

  this.cost = document.createElement('textarea');
  $(this.cost).attr('spellcheck', false);
  this.cost.classList.add("cost");
  $(this.div).append(this.cost);

  this.priority = document.createElement('textarea');
  $(this.priority).attr('spellcheck', false);
  this.priority.classList.add("priority");
  $(this.div).append(this.priority);
};

//add functions to notecard
Notecard.prototype = {
  constructor: Notecard,
  goToTop: function() {
    let that = this;
    Meteor.call("getNextZIndex", Modules.client.getProjectId(), function(error, result) {
      Cards.update(that.id, { //set z index in database
        $set: {zIndex : result}
      });
    });
  },
  slide: function(direction) {
    if (direction === "left") {
      $(this.implementation).css('left', 0);
      this.position = "right"; //right element showing
      Cards.update(this.id, { //set position in database
        $set: {position : "right"}
      });
    } else if (direction === "right") {
      $(this.implementation).css('left', 500);
      this.position = "left"; //left element showing
      Cards.update(this.id, { //set position in database
        $set: {position : "left"}
      });
    }
  },
  focusDescriptionAndEnableLeftTriangle: function() {
    focusOn(this.description);
    enable(this.leftTriangle);
    enabledTriangle = this.leftTriangle;
  },
  focusImplementationAndEnableRightTriangle: function() {
    focusOn(this.implementation);
    enable(this.rightTriangle);
    enabledTriangle = this.rightTriangle;
  }
}

//unfocuses when click is not on a pep
$(document).on('click', function(event) {
  if (!$(event.target).closest('.pep').length) {//if the target was not a pep
    disableCurrentEnabled();
    Modules.client.moveCaret(-100,-100); //remove caret
  }
});

//split a notecard
let splitNoteCard = function(cardId) {
  let card = Cards.findOne({_id: cardId}); //find a card with the id
  if (!card) {
    console.log("couldn't find the card to be split");
    return;
  }

  Cards.remove({_id: cardId}); //remove the old card
  let ghostcard = $.extend(true,{},card); //store a version of the card to be ghosted later

  //add the two new cards
  card.parents = [card._id];
  delete card._id; //remove id from card
  let centerPosition = card.locationX + cardWidth/2; //the position between the two new cards
  //insert a card one card width left of center
  card.locationX = centerPosition - cardWidth - 5;
  let leftChildId = Cards.insert(card);
  //put the second card at center
  card.locationX = centerPosition + 5;
  let rightChildId = Cards.insert(card);

  //add the card to ghostcards to be tracked
  //with reference to its children
  ghostcard.children = [leftChildId, rightChildId];
  GhostCards.insert(ghostcard);
}

//merge cards given in argument
let mergeNoteCards = function(cardIds) {
  if (!cardIds || cardIds.length != 2)
    throw "invalid number of cards to be merged";
  if (cardIds[0] === cardIds[1]) //if the same card was clicked twice
    return;
    
  //find the cards in the database
  let cardA = Cards.findOne({_id: cardIds[0]});
  let cardB = Cards.findOne({_id: cardIds[1]});
  if (!(cardA && cardB)) {
    console.log("couldn't find all of the cards to be split");
    return;
  }

  let newCard = $.extend(true,{},cardA); //make a new version of the card
  delete newCard._id;

  //merge fields
  //only append if second card has fields filled
  if (cardB.title) newCard.title = cardA.title + " " + cardB.title;
  if (cardB.body) newCard.body = cardA.body + "\n" + cardB.body;
  if (cardB.body2) newCard.body2 = cardA.body2 + "\n" + cardB.body2;
  if (cardB.cost) newCard.cost = cardA.cost + " " + cardB.cost;
  if (cardB.priority) newCard.priority = cardA.priority + " " + cardB.priority;

  //set location between the cards
  newCard.locationX = (cardA.locationX + cardB.locationX)/2;
  newCard.locationY = (cardA.locationY + cardB.locationY)/2;

  //set parents
  newCard.parents = [cardIds[0], cardIds[1]];
  let newCardId = Cards.insert(newCard);

  //remove the old cards
  Cards.remove({_id: cardIds[0]});
  Cards.remove({_id: cardIds[1]});

  cardA.children = [newCardId];
  cardB.children = [newCardId];

  GhostCards.insert(cardA);
  GhostCards.insert(cardB);
}

/*----------------
  helper functions
  ----------------*/
//disables the currently enabled object and enables the param
let setCurrentEnabled = function(object) {
    disableCurrentEnabled()
    currentEnabled = object;
    enable(object);
  }
  //enables and disables pointer-events
let enable = function(object) {
  $(object).css('pointer-events', 'auto');
  //$(object).css('background-color', 'red');
}
let disable = function(object) {
  $(object).css('pointer-events', 'none');
  //$(object).css('background-color', 'yellow');
}
let focusOn = function(newFocus) {
    newFocus.focus();
    currentFocus = newFocus;
  }
  //disables the currentFocus so that it can be dragged
let unFocus = function() {
  if (currentFocus !== null) {
    currentFocus.blur();
    currentFocus = null;
  }
}
let disableCurrentEnabled = function() {
    if (currentEnabled != null) {
      if (!$(currentEnabled).hasClass('bodyText || bodyText2')) {
        disable(enabledTriangle)
      }
      disable(currentEnabled)
      currentEnabled = null
    }
  }
  //finds the location of a click event on an object
let FindLocationOnObject = function(ev) {
  let $div = $(ev.target);
  let $display = $div.find('.display');
  let offset = $div.offset();
  let x = ev.clientX - offset.left;
  let y = ev.clientY - offset.top;

  return {
    x,
    y
  };
}

//add a card to a group in the database
let addToGroup = function(cardId, groupName) {
  Cards.update(cardId, { //set position in database
    $set: {groupId : groupName,
      locationX: 100000,
      locationY: 0
    }
  });
}

Modules.client.drawNoteCard = drawNoteCard;
Modules.client.splitNoteCard = splitNoteCard;
Modules.client.mergeNoteCards = mergeNoteCards;
